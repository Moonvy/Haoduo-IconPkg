// node_modules/min-mphash/dist/index.js
function _define_property(obj, key, value) {
  if (key in obj)
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  else
    obj[key] = value;
  return obj;
}
function readVarInt(buffer, offset) {
  let val = 0;
  let shift = 0;
  let bytes = 0;
  while (true) {
    const b = buffer[offset + bytes];
    val |= (127 & b) << shift;
    bytes++;
    if ((128 & b) === 0)
      break;
    shift += 7;
  }
  return {
    value: val,
    bytes
  };
}
var CBOR = {
  encodeInt(val, buffer) {
    const major = 0;
    if (val < 24)
      buffer.push(major | val);
    else if (val <= 255)
      buffer.push(24 | major, val);
    else if (val <= 65535)
      buffer.push(25 | major, val >> 8, 255 & val);
    else
      buffer.push(26 | major, val >>> 24 & 255, val >>> 16 & 255, val >>> 8 & 255, 255 & val);
  },
  encodeBytes(bytes, buffer) {
    const major = 64;
    const len = bytes.byteLength;
    if (len < 24)
      buffer.push(major | len);
    else if (len <= 255)
      buffer.push(24 | major, len);
    else if (len <= 65535)
      buffer.push(25 | major, len >> 8, 255 & len);
    else
      buffer.push(26 | major, len >>> 24 & 255, len >>> 16 & 255, len >>> 8 & 255, 255 & len);
    for (let i = 0;i < len; i++)
      buffer.push(bytes[i]);
  },
  encodeNull(buffer) {
    buffer.push(246);
  },
  encodeArrayHead(len, buffer) {
    const major = 128;
    if (len < 24)
      buffer.push(major | len);
  },
  decode(view, offsetRef) {
    const byte = view.getUint8(offsetRef.current++);
    const major = 224 & byte;
    const additional = 31 & byte;
    let val = 0;
    if (additional < 24)
      val = additional;
    else if (additional === 24) {
      val = view.getUint8(offsetRef.current);
      offsetRef.current += 1;
    } else if (additional === 25) {
      val = view.getUint16(offsetRef.current, false);
      offsetRef.current += 2;
    } else if (additional === 26) {
      val = view.getUint32(offsetRef.current, false);
      offsetRef.current += 4;
    } else
      throw new Error("Unsupported CBOR size");
    if (major === 0)
      return val;
    if (major === 64) {
      const len = val;
      const buf = new Uint8Array(view.buffer.slice(view.byteOffset + offsetRef.current, view.byteOffset + offsetRef.current + len));
      offsetRef.current += len;
      return buf;
    }
    if (major === 128) {
      const len = val;
      const arr = [];
      for (let i = 0;i < len; i++)
        arr.push(CBOR.decode(view, offsetRef));
      return arr;
    }
    if (byte === 246)
      return null;
    throw new Error(`Unknown CBOR type: ${byte.toString(16)}`);
  }
};
var INT_TO_MODE = [
  "none",
  "4",
  "8",
  "16",
  "32",
  "2"
];
function dictFromCBOR(bin) {
  const view = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);
  const offsetRef = {
    current: 0
  };
  const arr = CBOR.decode(view, offsetRef);
  if (!Array.isArray(arr) || arr.length < 7)
    throw new Error("Invalid CBOR format");
  const [n, m, seed0, bucketSizes, seedStream, modeInt, fpRaw, seedZeroBitmap, hashSeed] = arr;
  const validationMode = INT_TO_MODE[modeInt] || "none";
  let fingerprints;
  if (fpRaw && validationMode !== "none") {
    if (validationMode === "2" || validationMode === "4" || validationMode === "8")
      fingerprints = fpRaw;
    else if (validationMode === "16")
      fingerprints = new Uint16Array(fpRaw.buffer, fpRaw.byteOffset, fpRaw.byteLength / 2);
    else if (validationMode === "32")
      fingerprints = new Uint32Array(fpRaw.buffer, fpRaw.byteOffset, fpRaw.byteLength / 4);
  }
  return {
    n,
    m,
    seed0,
    hashSeed: hashSeed || 0,
    bucketSizes,
    seedStream,
    validationMode,
    fingerprints,
    seedZeroBitmap: seedZeroBitmap || undefined
  };
}
async function decompressIBinary(data) {
  const stream = new Blob([
    data
  ]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}
class BitReader {
  read(bits) {
    let value = 0;
    for (let i = 0;i < bits; i++) {
      if (this.byteOffset >= this.buffer.length)
        return 0;
      const bit = this.buffer[this.byteOffset] >> this.bitOffset & 1;
      value |= bit << i;
      this.bitOffset++;
      if (this.bitOffset === 8) {
        this.byteOffset++;
        this.bitOffset = 0;
      }
    }
    return value;
  }
  constructor(buffer) {
    _define_property(this, "buffer", undefined);
    _define_property(this, "byteOffset", 0);
    _define_property(this, "bitOffset", 0);
    this.buffer = buffer;
  }
}
function readBitsAt(buffer, bitOffset, bitLength) {
  let value = 0;
  let currentBit = bitOffset;
  for (let i = 0;i < bitLength; i++) {
    const byteIdx = currentBit >>> 3;
    const bitIdx = 7 & currentBit;
    if (byteIdx >= buffer.length)
      return 0;
    const bit = buffer[byteIdx] >> bitIdx & 1;
    value |= bit << i;
    currentBit++;
  }
  return value;
}
function MinMPHash_define_property(obj, key, value) {
  if (key in obj)
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  else
    obj[key] = value;
  return obj;
}
class MinMPHash {
  static async fromCompressed(data) {
    const decompressed = await decompressIBinary(data);
    return new MinMPHash(decompressed);
  }
  hash(input) {
    if (this.n === 0)
      return -1;
    const h1 = murmurHash3_32(input, this.hashSeed);
    const h2 = murmurHash3_32(input, ~this.hashSeed);
    const h0 = (scramble(h1, this.seed0) ^ h2) >>> 0;
    const bIdx = Math.floor(h0 / 4294967296 * this.m);
    const offset = this.offsets[bIdx];
    const nextOffset = this.offsets[bIdx + 1];
    const bucketSize = nextOffset - offset;
    if (bucketSize === 0)
      return -1;
    let resultIdx = 0;
    if (bucketSize === 1)
      resultIdx = offset;
    else {
      const s = this.seeds[bIdx];
      const h = (scramble(h1, s) ^ h2) >>> 0;
      resultIdx = offset + h % bucketSize;
    }
    if (this.validationMode !== "none" && this.fingerprints) {
      const fpHash = murmurHash3_32(input, MinMPHash.FP_SEED);
      if (this.validationMode === "2") {
        const expectedFp2 = 3 & fpHash;
        const byteIdx = resultIdx >>> 2;
        const shift = (3 & resultIdx) << 1;
        if ((this.fingerprints[byteIdx] >>> shift & 3) !== expectedFp2)
          return -1;
      } else if (this.validationMode === "4") {
        const expectedFp4 = 15 & fpHash;
        const byteIdx = resultIdx >>> 1;
        const storedByte = this.fingerprints[byteIdx];
        const storedFp4 = (1 & resultIdx) === 0 ? 15 & storedByte : storedByte >>> 4 & 15;
        if (storedFp4 !== expectedFp4)
          return -1;
      } else if (this.validationMode === "8") {
        if (this.fingerprints[resultIdx] !== (255 & fpHash))
          return -1;
      } else if (this.validationMode === "16") {
        if (this.fingerprints[resultIdx] !== (65535 & fpHash))
          return -1;
      } else if (this.fingerprints[resultIdx] !== fpHash >>> 0)
        return -1;
    }
    return resultIdx;
  }
  constructor(dict) {
    MinMPHash_define_property(this, "n", undefined);
    MinMPHash_define_property(this, "m", undefined);
    MinMPHash_define_property(this, "seed0", undefined);
    MinMPHash_define_property(this, "hashSeed", undefined);
    MinMPHash_define_property(this, "offsets", undefined);
    MinMPHash_define_property(this, "seeds", undefined);
    MinMPHash_define_property(this, "validationMode", undefined);
    MinMPHash_define_property(this, "fingerprints", null);
    if (dict instanceof Uint8Array)
      dict = dictFromCBOR(dict);
    this.n = dict.n;
    this.m = dict.m;
    this.seed0 = dict.seed0;
    this.hashSeed = dict.hashSeed || 0;
    this.validationMode = dict.validationMode || "none";
    if (this.n === 0) {
      this.offsets = new Uint32Array(0);
      this.seeds = new Int32Array(0);
      return;
    }
    this.offsets = new Uint32Array(this.m + 1);
    let currentOffset = 0;
    for (let i = 0;i < this.m; i++) {
      this.offsets[i] = currentOffset;
      const byte = dict.bucketSizes[i >>> 1];
      const len = 1 & i ? byte >>> 4 : 15 & byte;
      currentOffset += len;
    }
    this.offsets[this.m] = currentOffset;
    this.seeds = new Int32Array(this.m);
    let ptr = 0;
    const buf = dict.seedStream;
    const bitmap = dict.seedZeroBitmap;
    for (let i = 0;i < this.m; i++) {
      let isZero = false;
      if (bitmap) {
        if ((bitmap[i >>> 3] & 1 << (7 & i)) !== 0)
          isZero = true;
      }
      if (isZero)
        this.seeds[i] = 0;
      else {
        let result = 0;
        let shift = 0;
        while (true) {
          const byte = buf[ptr++];
          result |= (127 & byte) << shift;
          if ((128 & byte) === 0)
            break;
          shift += 7;
        }
        this.seeds[i] = result;
      }
    }
    if (this.validationMode !== "none" && dict.fingerprints) {
      const raw = dict.fingerprints;
      if (this.validationMode === "2" || this.validationMode === "4" || this.validationMode === "8")
        this.fingerprints = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
      else if (this.validationMode === "16")
        this.fingerprints = raw instanceof Uint16Array ? raw : new Uint16Array(raw);
      else
        this.fingerprints = raw instanceof Uint32Array ? raw : new Uint32Array(raw);
    }
  }
}
MinMPHash_define_property(MinMPHash, "FP_SEED", 305441741);
function scramble(k, seed) {
  k ^= seed;
  k = Math.imul(k, 2246822507);
  k ^= k >>> 13;
  k = Math.imul(k, 3266489909);
  k ^= k >>> 16;
  return k >>> 0;
}
function murmurHash3_32(key, seed) {
  let h1 = seed;
  const c1 = 3432918353;
  const c2 = 461845907;
  for (let i = 0;i < key.length; i++) {
    let k1 = key.charCodeAt(i);
    k1 = Math.imul(k1, c1);
    k1 = k1 << 15 | k1 >>> 17;
    k1 = Math.imul(k1, c2);
    h1 ^= k1;
    h1 = h1 << 13 | h1 >>> 19;
    h1 = Math.imul(h1, 5) + 3864292196;
  }
  h1 ^= key.length;
  h1 ^= h1 >>> 16;
  h1 = Math.imul(h1, 2246822507);
  h1 ^= h1 >>> 13;
  h1 = Math.imul(h1, 3266489909);
  h1 ^= h1 >>> 16;
  return h1 >>> 0;
}
function MinMPLookup_define_property(obj, key, value) {
  if (key in obj)
    Object.defineProperty(obj, key, {
      value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  else
    obj[key] = value;
  return obj;
}
function deserializeLookupDict(data) {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let offset = 0;
  const decoder = new TextDecoder;
  const readU32 = () => {
    const val = view.getUint32(offset, false);
    offset += 4;
    return val;
  };
  const mphLen = readU32();
  const mmpHashDictBin = data.subarray(offset, offset + mphLen);
  offset += mphLen;
  const keysCount = readU32();
  const keys = [];
  for (let i = 0;i < keysCount; i++) {
    const kLen = readU32();
    const kBytes = data.subarray(offset, offset + kLen);
    offset += kLen;
    keys.push(decoder.decode(kBytes));
  }
  const sectionLen = readU32();
  if (sectionLen === 4294967295) {
    const bitsPerKey = readU32();
    const dataLen = readU32();
    const valueToKeyIndexes = data.subarray(offset, offset + dataLen);
    offset += dataLen;
    const colMapLen = readU32();
    let collisionMap;
    if (colMapLen > 0) {
      const colBytes = data.subarray(offset, offset + colMapLen);
      offset += colMapLen;
      collisionMap = new Map;
      let cOffset = 0;
      const { value: count, bytes: b1 } = readVarInt(colBytes, cOffset);
      cOffset += b1;
      let prevHash = 0;
      for (let i = 0;i < count; i++) {
        const { value: deltaHash, bytes: b2 } = readVarInt(colBytes, cOffset);
        cOffset += b2;
        const h = prevHash + deltaHash;
        prevHash = h;
        const { value: kCount, bytes: b3 } = readVarInt(colBytes, cOffset);
        cOffset += b3;
        const kIndices = [];
        let prevKey = 0;
        for (let j = 0;j < kCount; j++) {
          const { value: deltaKey, bytes: b4 } = readVarInt(colBytes, cOffset);
          cOffset += b4;
          const k = prevKey + deltaKey;
          prevKey = k;
          kIndices.push(k);
        }
        collisionMap.set(h, kIndices);
      }
    }
    return {
      mmpHashDictBin,
      keys,
      valueToKeyIndexes,
      bitsPerKey,
      collisionMap
    };
  }
  {
    const hashBytesLen = sectionLen;
    const hashBytes = data.subarray(offset, offset + hashBytesLen);
    offset += hashBytesLen;
    const keyToHashes = [];
    let hOffset = 0;
    for (let i = 0;i < keysCount; i++) {
      const { value: count, bytes: b1 } = readVarInt(hashBytes, hOffset);
      hOffset += b1;
      if (count === 0) {
        keyToHashes.push(new Uint32Array(0));
        continue;
      }
      const bits = hashBytes[hOffset];
      hOffset += 1;
      const totalBits = bits * count;
      const packedBytesLen = Math.ceil(totalBits / 8);
      const packedData = hashBytes.subarray(hOffset, hOffset + packedBytesLen);
      hOffset += packedBytesLen;
      const br = new BitReader(packedData);
      const hashes = new Uint32Array(count);
      let prev = 0;
      for (let j = 0;j < count; j++) {
        const delta = br.read(bits);
        prev += delta;
        hashes[j] = prev;
      }
      keyToHashes.push(hashes);
    }
    return {
      mmpHashDictBin,
      keys,
      keyToHashes
    };
  }
}

class MinMPLookup {
  static async fromCompressed(data) {
    const decompressed = await decompressIBinary(data);
    const dict = deserializeLookupDict(decompressed);
    return new MinMPLookup(dict);
  }
  static fromBinary(data) {
    const dict = deserializeLookupDict(data);
    return new MinMPLookup(dict);
  }
  buildInvertedIndex() {
    if (!this.dict.keyToHashes)
      return;
    const n = this.mph.n;
    this._invertedIndex = Array.from({
      length: n
    }, () => []);
    for (let i = 0;i < this.dict.keys.length; i++) {
      const hashes = this.dict.keyToHashes[i];
      for (let j = 0;j < hashes.length; j++) {
        const h = hashes[j];
        if (h < n)
          this._invertedIndex[h].push(i);
      }
    }
  }
  query(value) {
    if (this.dict.valueToKeyIndexes && this.dict.bitsPerKey) {
      const h = this.mph.hash(value);
      if (h < 0 || h >= this.mph.n)
        return null;
      const keyIdx = readBitsAt(this.dict.valueToKeyIndexes, h * this.dict.bitsPerKey, this.dict.bitsPerKey);
      if (keyIdx === this.dict.keys.length) {
        if (this.dict.collisionMap && this.dict.collisionMap.has(h)) {
          const indices = this.dict.collisionMap.get(h);
          return indices.length > 0 ? this.dict.keys[indices[0]] : null;
        }
        return null;
      }
      if (keyIdx >= this.dict.keys.length)
        return null;
      return this.dict.keys[keyIdx];
    }
    const keys = this.queryAll(value);
    return keys && keys.length > 0 ? keys[0] : null;
  }
  queryAll(value) {
    if (this.dict.valueToKeyIndexes && this.dict.bitsPerKey) {
      const h = this.mph.hash(value);
      if (h < 0 || h >= this.mph.n)
        return null;
      const keyIdx = readBitsAt(this.dict.valueToKeyIndexes, h * this.dict.bitsPerKey, this.dict.bitsPerKey);
      if (keyIdx === this.dict.keys.length) {
        if (this.dict.collisionMap && this.dict.collisionMap.has(h)) {
          const indices = this.dict.collisionMap.get(h);
          return indices.map((i) => this.dict.keys[i]);
        }
        return null;
      }
      if (keyIdx >= this.dict.keys.length)
        return null;
      return [
        this.dict.keys[keyIdx]
      ];
    }
    const idx = this.mph.hash(value);
    if (idx < 0 || !this._invertedIndex)
      return null;
    if (idx >= this._invertedIndex.length)
      return null;
    const keyIndices = this._invertedIndex[idx];
    if (keyIndices.length === 0)
      return null;
    const results = [];
    for (const keyIdx of keyIndices)
      results.push(this.dict.keys[keyIdx]);
    return results.length > 0 ? results : null;
  }
  keys() {
    return this.dict.keys;
  }
  constructor(dict) {
    MinMPLookup_define_property(this, "mph", undefined);
    MinMPLookup_define_property(this, "dict", undefined);
    MinMPLookup_define_property(this, "_invertedIndex", null);
    if (dict instanceof Uint8Array)
      dict = deserializeLookupDict(dict);
    this.dict = dict;
    this.mph = new MinMPHash(dict.mmpHashDictBin);
    if (dict.keyToHashes)
      this.buildInvertedIndex();
  }
}

// scripts/core.ts
var GLOBAL_REGISTRY_KEY = "__HD_ICONS_REGISTRY__";
function getRegistry() {
  if (typeof window !== "undefined") {
    if (!window[GLOBAL_REGISTRY_KEY]) {
      window[GLOBAL_REGISTRY_KEY] = new Map;
    }
    return window[GLOBAL_REGISTRY_KEY];
  } else {
    if (!globalThis[GLOBAL_REGISTRY_KEY]) {
      globalThis[GLOBAL_REGISTRY_KEY] = new Map;
    }
    return globalThis[GLOBAL_REGISTRY_KEY];
  }
}
function register(pkg, data) {
  const registry = getRegistry();
  if (!registry.has(pkg)) {
    registry.set(pkg, {
      lookupData: data.lookup,
      baseUrl: data.baseUrl,
      chunks: data.chunks
    });
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("hd-icon-registered", { detail: { pkg } }));
    }
  }
}

class HdIcon extends HTMLElement {
  static get observedAttributes() {
    return ["icon"];
  }
  _use;
  constructor() {
    super();
    this.innerHTML = `<svg width="1em" height="1em" fill="currentColor" style="display: inline-block; vertical-align: middle; overflow: hidden;"><use width="100%" height="100%"></use></svg>`;
    this._use = this.querySelector("use");
  }
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "icon" && newValue !== oldValue) {
      this.render();
    }
  }
  connectedCallback() {
    this.render();
    if (typeof window !== "undefined") {
      window.addEventListener("hd-icon-registered", this.handleRegistration);
    }
  }
  disconnectedCallback() {
    if (typeof window !== "undefined") {
      window.removeEventListener("hd-icon-registered", this.handleRegistration);
    }
  }
  handleRegistration = (e) => {
    const detail = e.detail;
    const iconKey = this.getAttribute("icon");
    if (iconKey && iconKey.startsWith(detail.pkg + ":")) {
      this.render();
    }
  };
  async render() {
    const iconKey = this.getAttribute("icon");
    if (!iconKey)
      return;
    const [pkg, name] = iconKey.split(":");
    if (!pkg || !name) {
      console.warn(`[hd-icon] Invalid icon format: "${iconKey}". Expected "pkg:name".`);
      return;
    }
    const registry = getRegistry().get(pkg);
    if (!registry) {
      return;
    }
    if (!registry._lookupInstance) {
      let lookupData = registry.lookupData;
      if (typeof lookupData === "string") {
        const binaryString = atob(lookupData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0;i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        lookupData = bytes;
        registry.lookupData = lookupData;
      }
      registry._lookupInstance = new MinMPLookup(lookupData);
    }
    const chunkFile = registry._lookupInstance.query(name);
    if (!chunkFile) {
      console.warn(`[hd-icon] Icon "${name}" not found in package "${pkg}".`);
      return;
    }
    const symbolId = `hd-icon-${pkg}-${name}`;
    let url = chunkFile;
    if (registry.chunks && registry.chunks[chunkFile]) {
      url = registry.chunks[chunkFile];
    } else if (registry.baseUrl) {
      try {
        url = new URL(chunkFile, registry.baseUrl).href;
      } catch (e) {
        console.warn(`[hd-icon] Failed to resolve icon URL: ${chunkFile} relative to ${registry.baseUrl}`, e);
      }
    }
    this._use.setAttribute("href", `${url}#${symbolId}`);
  }
}
if (typeof customElements !== "undefined" && !customElements.get("hd-icon")) {
  customElements.define("hd-icon", HdIcon);
}
if (typeof window !== "undefined") {
  window.IconPkg = { register, HdIcon };
}

// iconpkg/mdi/src-index.ts
var lookup = "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";
var chunks = {
  "mdi-01.svg": new URL("./mdi-01.svg", import.meta.url).href,
  "mdi-02.svg": new URL("./mdi-02.svg", import.meta.url).href,
  "mdi-03.svg": new URL("./mdi-03.svg", import.meta.url).href,
  "mdi-04.svg": new URL("./mdi-04.svg", import.meta.url).href,
  "mdi-05.svg": new URL("./mdi-05.svg", import.meta.url).href,
  "mdi-06.svg": new URL("./mdi-06.svg", import.meta.url).href,
  "mdi-07.svg": new URL("./mdi-07.svg", import.meta.url).href,
  "mdi-08.svg": new URL("./mdi-08.svg", import.meta.url).href,
  "mdi-09.svg": new URL("./mdi-09.svg", import.meta.url).href,
  "mdi-10.svg": new URL("./mdi-10.svg", import.meta.url).href,
  "mdi-11.svg": new URL("./mdi-11.svg", import.meta.url).href,
  "mdi-12.svg": new URL("./mdi-12.svg", import.meta.url).href,
  "mdi-13.svg": new URL("./mdi-13.svg", import.meta.url).href,
  "mdi-14.svg": new URL("./mdi-14.svg", import.meta.url).href,
  "mdi-15.svg": new URL("./mdi-15.svg", import.meta.url).href,
  "mdi-16.svg": new URL("./mdi-16.svg", import.meta.url).href,
  "mdi-17.svg": new URL("./mdi-17.svg", import.meta.url).href,
  "mdi-18.svg": new URL("./mdi-18.svg", import.meta.url).href,
  "mdi-19.svg": new URL("./mdi-19.svg", import.meta.url).href,
  "mdi-20.svg": new URL("./mdi-20.svg", import.meta.url).href,
  "mdi-21.svg": new URL("./mdi-21.svg", import.meta.url).href,
  "mdi-22.svg": new URL("./mdi-22.svg", import.meta.url).href,
  "mdi-23.svg": new URL("./mdi-23.svg", import.meta.url).href,
  "mdi-24.svg": new URL("./mdi-24.svg", import.meta.url).href,
  "mdi-25.svg": new URL("./mdi-25.svg", import.meta.url).href,
  "mdi-26.svg": new URL("./mdi-26.svg", import.meta.url).href,
  "mdi-27.svg": new URL("./mdi-27.svg", import.meta.url).href,
  "mdi-28.svg": new URL("./mdi-28.svg", import.meta.url).href,
  "mdi-29.svg": new URL("./mdi-29.svg", import.meta.url).href,
  "mdi-30.svg": new URL("./mdi-30.svg", import.meta.url).href,
  "mdi-31.svg": new URL("./mdi-31.svg", import.meta.url).href,
  "mdi-32.svg": new URL("./mdi-32.svg", import.meta.url).href,
  "mdi-33.svg": new URL("./mdi-33.svg", import.meta.url).href,
  "mdi-34.svg": new URL("./mdi-34.svg", import.meta.url).href,
  "mdi-35.svg": new URL("./mdi-35.svg", import.meta.url).href,
  "mdi-36.svg": new URL("./mdi-36.svg", import.meta.url).href,
  "mdi-37.svg": new URL("./mdi-37.svg", import.meta.url).href,
  "mdi-38.svg": new URL("./mdi-38.svg", import.meta.url).href,
  "mdi-39.svg": new URL("./mdi-39.svg", import.meta.url).href
};
register("mdi", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
