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

// iconpkg/ph/src-index.ts
var lookup = "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";
var chunks = {
  "ph-01.svg": new URL("./ph-01.svg", import.meta.url).href,
  "ph-02.svg": new URL("./ph-02.svg", import.meta.url).href,
  "ph-03.svg": new URL("./ph-03.svg", import.meta.url).href,
  "ph-04.svg": new URL("./ph-04.svg", import.meta.url).href,
  "ph-05.svg": new URL("./ph-05.svg", import.meta.url).href,
  "ph-06.svg": new URL("./ph-06.svg", import.meta.url).href,
  "ph-07.svg": new URL("./ph-07.svg", import.meta.url).href,
  "ph-08.svg": new URL("./ph-08.svg", import.meta.url).href,
  "ph-09.svg": new URL("./ph-09.svg", import.meta.url).href,
  "ph-10.svg": new URL("./ph-10.svg", import.meta.url).href,
  "ph-11.svg": new URL("./ph-11.svg", import.meta.url).href,
  "ph-12.svg": new URL("./ph-12.svg", import.meta.url).href,
  "ph-13.svg": new URL("./ph-13.svg", import.meta.url).href,
  "ph-14.svg": new URL("./ph-14.svg", import.meta.url).href,
  "ph-15.svg": new URL("./ph-15.svg", import.meta.url).href,
  "ph-16.svg": new URL("./ph-16.svg", import.meta.url).href,
  "ph-17.svg": new URL("./ph-17.svg", import.meta.url).href,
  "ph-18.svg": new URL("./ph-18.svg", import.meta.url).href,
  "ph-19.svg": new URL("./ph-19.svg", import.meta.url).href,
  "ph-20.svg": new URL("./ph-20.svg", import.meta.url).href,
  "ph-21.svg": new URL("./ph-21.svg", import.meta.url).href,
  "ph-22.svg": new URL("./ph-22.svg", import.meta.url).href,
  "ph-23.svg": new URL("./ph-23.svg", import.meta.url).href,
  "ph-24.svg": new URL("./ph-24.svg", import.meta.url).href,
  "ph-25.svg": new URL("./ph-25.svg", import.meta.url).href,
  "ph-26.svg": new URL("./ph-26.svg", import.meta.url).href,
  "ph-27.svg": new URL("./ph-27.svg", import.meta.url).href,
  "ph-28.svg": new URL("./ph-28.svg", import.meta.url).href,
  "ph-29.svg": new URL("./ph-29.svg", import.meta.url).href,
  "ph-30.svg": new URL("./ph-30.svg", import.meta.url).href,
  "ph-31.svg": new URL("./ph-31.svg", import.meta.url).href,
  "ph-32.svg": new URL("./ph-32.svg", import.meta.url).href,
  "ph-33.svg": new URL("./ph-33.svg", import.meta.url).href,
  "ph-34.svg": new URL("./ph-34.svg", import.meta.url).href,
  "ph-35.svg": new URL("./ph-35.svg", import.meta.url).href,
  "ph-36.svg": new URL("./ph-36.svg", import.meta.url).href,
  "ph-37.svg": new URL("./ph-37.svg", import.meta.url).href,
  "ph-38.svg": new URL("./ph-38.svg", import.meta.url).href,
  "ph-39.svg": new URL("./ph-39.svg", import.meta.url).href,
  "ph-40.svg": new URL("./ph-40.svg", import.meta.url).href,
  "ph-41.svg": new URL("./ph-41.svg", import.meta.url).href,
  "ph-42.svg": new URL("./ph-42.svg", import.meta.url).href,
  "ph-43.svg": new URL("./ph-43.svg", import.meta.url).href,
  "ph-44.svg": new URL("./ph-44.svg", import.meta.url).href,
  "ph-45.svg": new URL("./ph-45.svg", import.meta.url).href,
  "ph-46.svg": new URL("./ph-46.svg", import.meta.url).href
};
register("ph", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
