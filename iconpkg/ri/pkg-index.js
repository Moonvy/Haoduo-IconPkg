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

// iconpkg/ri/src-index.ts
var lookup = "AAAQ9YkZDJ0ZAoYado5YlVkBQ1NDZUEkITQVdCZkZRYmU1VoZDM1K0UmN1JoeUVXtHIpOEQ0VxdTR4WHh2YlpzVEeFVpZZhkM2JCNmhVhEZIZnODI6hFdmRCd5SEgnlzRCNmYmV2dopklzaHR0SDJTZURHIyJCV2dUVlJhU1SHYkZGmIRUI4VWhzc2YzN0ZEclVFUkV3MmY0ZFY3R0MqwTIyMjZmV4g1QmUqZ3USZ4RGNTcmSTRXQldWRXQ2RUQyM1RWUlZAdlUmdRNDNzIxWIBlQzRVRpV4VUZlY4WGVWhVNFPFpqRDZydSc2Q1JlNGJWQ0WUQWQ5ljVXazRkVVhXNVA0ZjlzllhmYpQ4RyZWV0NBRFQnQjaGKjlmVhRkR1RFY2ZGlSXEJUJqg0WVI2gmdEdTRzNmNHNidGhRQ1M1c2lzQ2U0RFglJyl4hFFVYiRImDhFpjWQKrBAMSEjQEAQIBAgsZAiVZBiM4WG2fAgdnCRSGBFMDCQIKAZYVOBA0AQ8FF9cBNaAFDAsEfA0K3w8CO4gEApsDAQEBAYQCBboCAhsBBS75AymMCq4BSxcIBnacHQYGDQS3AyMhFo0CNQQNsAOrAw8VAwGIAgQZCs0HGxALAQcJH5gDCWsrAiIB1wUEwgOmJRUGhwGxAwFqCrYBogEO+QkJxwW2BMYLkwEFZBIUAx4zAQ0jRhpVNaQD3AsCV2yqAm8Hb+4DXgMB4AYBFgMHJxkFbQEeMwJn5gROXxQGlwEkawNXBQa6AwQPmgEXAgq6ATJJkAK8AQgTAQPqDAxkA6MBMgPXARE8ASgGAiACXgIDAwQKHC8OARlCAnepAQKHASICARwXFLABDgYM+CrEcgEOKAIBBFfNAhUDDQNVmhABmQJSIc8CZ0QOtgKuAQFoCDwDpgGLAwIEBOwEFg6rBxLDAz4CEtsCrQIEDAICAQEHCQEZgAEdDGL3AS6kASADMwMCIo8DAwILAt4BGfIBKiABFRQEAVA+BCeYHKQBaQcxHgIafwECOoIJBTYiCcYJRBQECwEFCwOoIs4CshQSvwQCD2UxnwQBHAuyAQQNDRMBAggpBBASLwUBggECAzUNAsIBmAEFhgEbGyxTA7QCMBMJAwgJEa8BBcMBDhQZHwgXfBeBAQQKdHQaDiqQAQIYA7wB+QIyeRQjBLMBDQMJAw/rAQEBgQFOYwOLBjiLATGEAfEBNx0FCZUCAwoYFAEGAzjFB18ytCwRAwYSiwECsAHOAg6FCA8OvwEGAfQCkAGqAQQFFDcE9wEOAggc4QINIQeXAQ8SS60BEhcFAs8CAwMBlwOcAicCByg6AcwOBhq3AoUDsAaRAjIwCgItGgEGCagY+wl1AeYChC8aBwQCWQydCEdDv4EcIvvIUOxtTbz9PVWWSgvu/4DfNwXi8JH826qk1pCOtez2PxSHP/NMfbMWU/6lspPJhv+TKmcdj0gLTS08oM8MDQGEoxRnw4l/IbYXJ18+3bjjHT7MkYBwO1OzwEPu56YkJjHQZe/wM4lxx27Yyvc5NIEKTjI3XcRl6mCnc5IDbSppYhyzR6Vw9eYK2CSTUMIMs9lB5kK0EZ8KVDPRvmSqJFwrE+6toyfNV5lEUWuSxeKRHUh8mdol6/yi0GByUpwzANa43yZSMh52tS8hHKQJV2kk6phL3RPBaljOKNy0t1NQHwSrbXqKIXruJYjtBW1vSnV/+qVXzioyE0Y8CMyZCGhE3Bh7qj3UMPqrk9dEyFHy8eskt1CLEcGiwhiyRAnyiHq+tBCxjzT66WgRHnByYYAbg/e5Cyo5NB5d6wBUu9i4IZNoJpT1i2SvMKCx2BFMwLdK45ST6oZl14LRMPd2zkiM7Ivly3tiSQ8N9t91zdfBRKjv0FIQFzhurltLqvWVPhyViFJvgSc8odE9Jib1xc4qc1ZqY3W+Gszz/vvHKVhzFlYj+2Il6+AvbGay3eOwXmdFTW+aEU5y/3EqdP8uU3FlrWzVg0pXucuDX3bgLFVD2uWAr8oowuGnsnUFxG1dqQ8uaj70beqeIOBo3yLMdlTnIsvTZAbjOlGoa3NYxqTonUUz0b85dDTx9Al53tCfaH3vOHmK+CpE9huiLCEHogLi9N1N/YwH+2NFy7bBtyHR2IxkKa9WySThsxpSGDzrxmVqi4ZnyHU+uCGUb5KRFCtX9GYVBsc0szhPUCoT6KmKX9Sr3pFF/QDo9Hrkp9XtqHnmlfXkUUbxcBi7qsvoosyR/dhtsV8Q7xfWx1SY5NPDeiqG/spG3mpm6C+3o0JbFjK4zl8KtKQEQ/1rt5K27Izfna9rLYNbtIAEyJkfWfZGOBkEln4Yi4umhUyXCHnu2LhJMCIpahtZ71IIRtVlKAASe409dApcyxPqgQD1Xzq7WjjxVES8uthTMVwM+Ja+1Pmu+pjNXTBh/aNoW08xa/DzCBA9suNf4zxoijjx+K1VR2vDF0Y9unBk9UZX6hLRNLw6YQUH9gFqHBecO9/+uc70yv6I6Yq/OavntEFlS66OsEiZD4G0XvB6XV+6ByP7wfWr6FTNhccTPKJw9kEYJ3UXSb9zFETKR1buk7JPdRRMr2yjwPDJsPr+2csa9aU85jFjkxU3ELqvgiq/49+fGIm5SeHIl1ObCtbCKhCj+84golJVl4YweeN/qSxsP0hYc0TpW+8EqZZqevQVsc3haRcZnVgwId6EzSjCVYwuUE1aHQjegxfw0TQLfSODulfJKZ34a53fzG2rs8s+lrVWcqrVzhn1qMj6rrEfRE8OZZ0tG3C1Mmh5Ayh2HS7Om7nvgrGs4uLM2YgouZLzhGGpG3yCluGKBRhfGByo5igD44/JvP6u23v4MUlDRyzfpe65ik4Lrv43KxUWJdSKHXUHznBxzJJOPLb6HfH7sIFHwJTblPA+AjrnXd1WxAO/C04vKnSaKj3zh7GF7GTl+eMkAhkC1ky5iuEX336a2AJog5Gk8gT95JxY20JQGMzSecU8l4dMl208KmpavdeWdjvtu3d5Cj7Fv5eDcYOSSRPXdfELld7TvD4qpNryqQukhrnliO4E4oN06k9L2RiXmjb8YO3jdDEbvXzYi9mKAQJyXa5V2Biq2xX5jQhmx6zKHqTg6C7vlFp5OoiPiIMFPngIPCtz6l4iCoDHXpAw4XGGRlrqqPYPxhcS19xja55qRpiezWlq8E4EfrWJRGny7qhmAruVU/iMYSuNN8BLhVlSfKPlf1V1GJngjN1sRKpnn9WShh81SbZOyYQZD1TjW0+bRR2IiBdzDQCbF43nOtGUsqf9+VVSVFE/OyBK22mD0ul2ET0Xoqhp5JAUZnqKu/8HiZ/aQHdHw0Hw6Kzal2SglUuCjnYuWhNS3H6YSsZ3DfOTGWvKOIdT3GNygJmu+dZgzhIYjm3xLmCP+4r5xbtrwSwBwQ8T75bp+197WNZ3UR2QKFDY10fCD+FA2nmmd3vRSdKLG05DD7eYc59n7jaEcT/VlX/HmlB9AVvOYHd4qBm2k9b/dH4TuCP6ps3380ATRon4G/UUMLWcCE9wXYYbOgnBCUzadmNC4pXTUQAH0N+Qu2F8STOkHxZHm4l12heQNpI/fkUqSfIEE59droT0zVNX6evfDxwZZ1Y/TuAhMz4FnFHd10Cf0R3pZSJv8C0YhJ4Uow6v/3btW/JkMnJCNrfYrWsFkZJ/TFQSa7MznzxjibPS9wx7KH182t08jeFDyYql4U2tCZbldkdcjdJj1NuZjU+NKBMvBzy+QZahS6sUwj++fkpVkj+HeLR/ar2kx74loZ1XjPv7NZNfH+xXQMZ2rwW1PF0xNWSZiGvy6xboQ1U55GwfSJgD1dcAguyF3KbAQ133Hs2HWLmMIM27pVf5hm+MXt/08jmgGIjEZJTO8zZaLbNVI2j/DYe0n6+CRDZ8LnRIl8SB2pcRxHencPvWmuRM9nR3VF4cTbwRFYoZJaf+3MMaxDE57PXeYUt7JwMhbSmDx6CJbrxOGpOdHO7jqyqz/73tWNo6NI9gkB0uXucDQ7EE3uQZ3hRXOlrO2oRffCWBt381Wo+RCjidg+2EMumrWOvq4ePKKldPctjBS3Yq0ZK/xShcfzj61J463Uz5DvSGVT44nsz9yQo7bLYiMav94vB+o3heY0faQF/oFZfu8bXSpocJY5lJlXRUJNqUFiC4ivKu/MH11DHO2GfTv5Es2NJmDJCoH2cvGPPU6dzCgldCWMBbRpNcegpZN7Rs0vYaYcd9k50+xPvuau/r21Gh0UTIhxFr13zTibKEju9lWliHbu20u5Y19zPvt1Al4qaK0mY++Kodd8P1ab92JKqzzNk/DJMHbrhQHeR3aAgIEX7qwFsya9TB7+6BsHlh2OSQgym00vNHyRIbfyNHZqE7jEhnS8QJIy0Ph0B9783s+6YXyNeznnkjz0LruFnFqlOCqRRU14yK6g4h/jX8F792KzVSEweaon+c99t4amE3XGBYSrbdGeDEL/TNd5u/lQA/stzSR+SZ1lonOFrkE+8PG5CvL07whCTf1O69AYIa4v0GKNObGEvr/VRL8aUmlPXhDo/aWdPDrcD5fqP8+qiaPH70fVUHcAPxPaF5sYkfn9QAfebFFVy9frFuKmP65LC8CpJIVsaIAbUnzkg+C7EQlgAhR1GLcx7VeShwuKKAvw6BimJmBu0099o6fA+Ltq2VxpdC9CeLFHACoQbZQitrwZSTvVGz8WDR8OPPeL11RjOAIAQsyJbqjyh6aCQI96wITmlEOGxJhJyRveM3C5ppqrtkgoKi4asAOiN78CVd3LO2kc68bZI2eUnwFkm118heAih0DprV2UeEaB6xjkfofKNfFIDvjH6V5R04KRAw4g1XX9U9gAoGyNqW8KEn+EFGNuKWuPSxKbD3aH4lho8V2ABZFWWIzX69ZK38C1+LeNbwL26ZjWLo+B8D6ZwzdtgKutECmtWWpRiih4SUHS2oz4BZ4FKARDJlSIp2GDSHuJsRTMRSYauE2nOv8XqdsMeEk1OMAISsanJ7DJDEpyPVGkooRnIZ+OWG2M271RSYHWN94x1exFeEWXPUhI2B316qSO2fIA1r/5jgfpu1x1E/rxzX2REnBRFBtevHsJIrqjei5c1NX38hUzZJQsToVGSWcX4HmjvePwVD1lXYYbLPNCw1RDECmV4npjK+E9a8c/dWv5TcLcakswUYqMyZzKA0hudgb2QQAdfDEQRnCmpgpy35xxGzn2MZrFuEC/MqPFEY8UkliFbhVLvpAZjJtQ9CLrZLyngpEpqssHE5GDISPevprKNm6H9lO1qBVndow6R6YfOUnbt3qC7L1uoj8MEgMsKM2QTf12wGgmQ2jpymMRBXjstpX7f4Rgi96ebBWnk6a9Cu61kVnNjoX8ELgecE4s6tTQm03E0PWOheniL0lyvONJL+P7U6fITVER5CYcoqgkwRHGAb6EIiYyoETa+blSxce5Audg0nRRyEeDtayY1AK9fYXASwQk5bE6cBh2oebcPQgZv/Q+WffKyNMc/RAHLsHxtpdHv3bumXPrKBttSzODyPgdRp8AdTThQcA6L3VannOcwpO+VFEWvbTRubL2b4L/BNQrodklRnlOs/1FHSabi/0gV78ltAbSrc62RwDKTikGnOTgAW3pzJEeSlNSANdEzze1QzqgCtDBBhwBLdOTplES8o4kC8CT7MUvdWqFhRRIQICggCAQAgAoAAAEgAAAgQEBABAGACJQAIAAAAAARABJLtAgIwAAKBkDQQiEAEAAAAAAAIBAgiAADAAAARoBQERAAQAREABiAowBYQIEIAAAAAABEAAAAJcmktMDEuc3ZnAAAACXJpLTAyLnN2ZwAAAAlyaS0wMy5zdmcAAAAJcmktMDQuc3ZnAAAACXJpLTA1LnN2ZwAAAAlyaS0wNi5zdmcAAAAJcmktMDcuc3ZnAAAACXJpLTA4LnN2ZwAAAAlyaS0wOS5zdmcAAAAJcmktMTAuc3ZnAAAACXJpLTExLnN2ZwAAAAlyaS0xMi5zdmcAAAAJcmktMTMuc3ZnAAAACXJpLTE0LnN2ZwAAAAlyaS0xNS5zdmcAAAAJcmktMTYuc3ZnAAAACXJpLTE3LnN2Z/////8AAAAFAAAH48gsFNJ6DzmAiFrjgTDIakmktwIA65hiVoHvtPdaY+60IM5IBjF1EELClDFUawEdV1CCLAQ0HhokuERceUOlplpa7KC22CgsAbLWcYw0lkRo5xgQwltBAANaaYqY10oabiRRGkmiFKMYREckk4YCojRX0lEFtAZCOiSABYQZ7iwDCmKOOVJaQUcMpNgy7AxnzgGpmJGAWawUlo4LrK2AglhsJceUUoYNhNoCR42WDGQLBZbQOQA59JhxjKxz3CILqETacIaUAYJ7qwHBjmDOiTAOWQK8J1YqRDQnzkjKHYWAUYAdFRIyrQVRmCEriIYSMq4gt9JKgJV3lCrHEZUeU+ixI5op6bWTEEnpncdaEIKMEdAhLzX0jHNtPPBOOiqBdxx5C6AEzknMAZKAQ6aRFkJxQ4GVjForhOEQeGuAF5AQbDgzIBoklEOcIwI0xR4hTpRUHHqBmPOeIUUd0laCJgxhkgHMGFdAcuSxV4w4Ci1nEEBvhYSeOQyqJ1hCBolwXmvHhfCQE4gpw0BICAUyVBmBNNCQe8OA51oxBRhDVgpHoSOKS+A1JcpoJwDghBIiobeKUaO4BlxbpChXjDPmrWBGG4wMlUZQCCmDYCHKBYJAS4aAIoRrI4gjnEKPrKeQM/C4ApZyhI1zkiChmUYEUuQsFJ5AS5RyGAFtlaKWYocZYZ4qSCGBVChgFMaEGAaUdQoiq6SnWBkOiQfaUaE5J0hp7B2FVkFiGVJSQS+1BUoxqYSXyEosIaUOaK8RM8Zr4DzC2BKCJGUcSCyUVJoJKqF30CsLiaRSAgM9N0h4hKhXHhFPBPKWCiolYlATTIGxFErCjCKccmMRUcxK6oQSlgjknSLIY2sd0NYKCrTzzEsQFEUCMQS4osR56ZGC0DPumUMIaO84cdIwrZlmyFimhBTeMsQBh9xpArE1oECsjIXEMmMQopxgyjDlzjDNAJKQUaMQwMhhT6XgjGnDMCPYCWg0J1ZqaxmmFilHhIcIEUQIJUJ6hgUDFmslvJXQM0s015YKj6nAxmtPIfUEKYMVtgpRiC2ERmhCLaSCYSkVxIoi7CjCRgLOlZeKGOmcddYYTiRSBgpAuDLEYyewtVwQQRhFXiGKKeGKIQ+ENowrzCxHXBkMjTHKUkAkFBx6AxWRwBFtCRQGYewgJIIhpR0WijmBoWfOGAEmMIgrKiChSmCPsAIcY6goN1AR4gF1mIIQFLMGPATANkxYo5gUTlkpANaEKc8ttsRKCIwTmjKECEbASEGolMARZYBxWHGPtfFCa0WRQ0ArrS1hnijqGBbUEaGhcVJiwTkRDgsGuUFeGo84Q1YpCTHjBijMJTbKC6oB0N5SyoDCnjsKhZQGUS8UVVpCrSlgwCFvgOBCWa4ocRZLjiQm3FEOlQGQECw4p0xwJqTDBhvhtefMYe4ttZAzgKFhxlPtjReYIqAx9EJzS5BnBmCHPRReOIKVJxRyxRW0FBLireEQCgm4dd4a6RVlCnhrmGPAeqA85txAI7ziyhPoiHKWKW6VMMgiwiwAhHNpgONSKiawwgQzqh2FiGEJveSWGIeZYQR7BAxG3EJvAJXeA6yt5tBASZETxBlEiYGaWymsJdooCCDDlGgivDOCMwmwc4I5Iq0DWmKNkVZMEMOVQwQqoRUAVkInvaaCOWa4EeBSjiEEBArJEfTCW0CQxZoAR61nAnnKKaNcY08wUFIJ5yU1XlqGPZfYcgMAc9ZLRz0GBGpiBDBGAIIwtgxpJDAknEKoAMQYO284RcZAz4ACkFDkAbPCM801uJIDBAj2RFjlADKaQQOY5d5oTRy0wmgFJXGIC6wU0NBTrCTFjBovAXMEYQ6yo1girT0wgDEiINOAOmI501IhBCyRCjtCrcNMYS8Q5gZBhcEFnivJgQHeW6cd1gp45izihGEghaDIGcOpNQhxpigA0iEJBJFMe+65s1BJ7qiSHghosUSQUQ4IMUIQa7ThQgOFGeQcIqw0MAIcDj1EBDukNeBESiINZVhoJxRxViMKIAeKEmGx8p5pAx1B1iEKEAhUMyA0I4QxrQFkGElBHCYWAomllEQKBCn13kFAvRTEACAwFU4QhSmoxANrtbYGOGyQxMBSDYXGQFGOqNOIEYmVgBZQ5QXihFKutRZMKyWMtV4KI61TDkMuiUDEakqwVMQ6jqHy2COoBTYcAEE9Z9YChBCmVmCtkKASKeME4VZRaQxF3oADuOeQAJCMBkBIBjQnzmkDkEGUEuOIZBwSgSgV3FgHIMQMO42s9FxIYbQHhDALEGGaC+c45RRhDSmHFEyFHbIECIIgloZRpjGW3jqnBIEUckKcQ1YyTqXmzgpkHWUUYAghYBgxoo1VQDljvJTQCOSw9RpQLZ3H1iGqkJBMQKMow9ZzbTgXGmJDAbeMKaqU5QhYoonRXkjpjOJCYQochVB7ZYzVyCJLtAdQUSYIYJRLZJHEHgGpIAZUCMIR9kZBqSggwhqJhJMcIoekY0w7wASTDErtveMCQcdAN1JQYS0gDiFnrKFQQKQZl0ob6ojWimrDMJcgSSw1Jlpq4ijRzmMgtdDCM+uYJNYzxCTiThrPCejaCu+0MUYZa6FlVhrGpOFaaKMB8ho4wLAHSnuFuKPIIUmRp8o6aL3xSBoNtAdMUyW49koLx4U31jpqGYZYIMCxUxowqp2zEELvvILWMiS0MZYzAIgBAAAAAAA=";
var chunks = {
  "ri-01.svg": new URL("./ri-01.svg", import.meta.url).href,
  "ri-02.svg": new URL("./ri-02.svg", import.meta.url).href,
  "ri-03.svg": new URL("./ri-03.svg", import.meta.url).href,
  "ri-04.svg": new URL("./ri-04.svg", import.meta.url).href,
  "ri-05.svg": new URL("./ri-05.svg", import.meta.url).href,
  "ri-06.svg": new URL("./ri-06.svg", import.meta.url).href,
  "ri-07.svg": new URL("./ri-07.svg", import.meta.url).href,
  "ri-08.svg": new URL("./ri-08.svg", import.meta.url).href,
  "ri-09.svg": new URL("./ri-09.svg", import.meta.url).href,
  "ri-10.svg": new URL("./ri-10.svg", import.meta.url).href,
  "ri-11.svg": new URL("./ri-11.svg", import.meta.url).href,
  "ri-12.svg": new URL("./ri-12.svg", import.meta.url).href,
  "ri-13.svg": new URL("./ri-13.svg", import.meta.url).href,
  "ri-14.svg": new URL("./ri-14.svg", import.meta.url).href,
  "ri-15.svg": new URL("./ri-15.svg", import.meta.url).href,
  "ri-16.svg": new URL("./ri-16.svg", import.meta.url).href,
  "ri-17.svg": new URL("./ri-17.svg", import.meta.url).href
};
register("ri", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
