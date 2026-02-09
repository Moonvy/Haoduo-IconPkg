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
