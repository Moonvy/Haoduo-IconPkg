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

// iconpkg/simple-icons/src-index.ts
var lookup = "AAATOYkZDlIZAt4a7Sbc8lkBb2higqI4RYmCVldFZjNGNEaERmdxNmNUVUI1c0QTY3XDlVNmM0V3KURVWDZlJzZRRkJnY3SacSZ5cWhVY5dAKFdzRkZpp1UmUWVFI7U0BSJ4YzUzZXJiNlOGR3KEI3R0NFaIRShzU4gzRGRUNDRDQ2MzNkN0U3RxVTcUQ3RkZFU2YnQjRWNneGgldFZ0U0hVJZR1MzdRRCYoQ0VIRTVGcklIIhV4OEJGREFZA1VTa1FGUlVUUyUmlHVEY0FEU3imSDNyp1KGN0NlN3RDVWQWc6lzVTM2RVWiMhJ1dheClGQqI2UxVTNTQzQkRXZEh0SXeiNlFSZUU0N1N2XDZGUzRlNla0Y3M2NEJENjOikzoqIUgkdKQ1RUglWJR3ZkF3KHxGZZdrkXRkM0MUM2IFd5RYdVqlayhmc1RVYplVZFNyNzfGV2JlIJFjc1lKlUZndIRodGxlJXNVRHpTMWE5YyZkRKhHFWZ1R5VTl8VFNzYkpZAwOwASikAegBgySdAgcBEE0HAU6KAQcdCiUeLBYBAgQPAQcLD94GAw1uZtsCTQUMDwJaMikCCRAGggEBAgMSFksM1cQBUaIEH1Y4BAEKFguWAbcJEB0RE4UBOn4BHhqGAloMgwEMC7MBAUocGdQD9RysBB2LBKgBDw4rCQZJAfUGwQEvWQdlZAE+B58HE3KPHQMWOw4GUBkCCwImkLUBAgUcAwE+LgcVGAIJFSIHngIBUXsDAwIrNgMHRgEFHgUe/wIRNwuDBJ0BOgHNAQIoBhXBBbsEAQIJGQc7AS0RBR8MAQsHuQIHAhwIAhYPMgMMAV/YAkQEWgwBCAbGAiA/BYgCDUpVDoIBCYoBBQ0MBhcengHxAYMBSzQQHmcDBDkBDMQBFg4CQQEOAiCBAQXrBgQGCgMD8wMBBiEQDqoHBR8MBQ9ZBgyuAgOHBRADjwGnAcEEAQEPKBwKAQaUCS8BBQEHaJUcExQHBAENMRQfERYEBgIBBi/HAg8HAUAFAwSWCrsB/wGaNnYUBhG0BHqfFgoWTSwFHww2AwEjASAHAUSlAQvpAYIE8weRAgiJAQMFHwVADAWcCwECOXMEf/MBAYoEvxMotywCB2YIBB4cBAIBEQkVHAEHBwOfAQgd5QHLBwENvAGoAoEeSAICBy4WaQ8ZBVERAghmGhkElGgFAh8EAQILBwQ8HtwXCDIBUAEBAsYBBgMDARoLM94BAdkGARECogYChQEa4AIoA78PHAYiARYDRAwREa4DkwY2AgiAAREO3QIGvgTNAZcFF71f6wFNgQEKUXHdC1YRggEaCAQEDhIDBI0ClQEzRQLsAZgBAQiaB6I6IBYC/RQdE/8BDAozIA0MigYBO/QFBwgLA7ECAwIB5AawzwGMAQkHAtsBXAECDv4ETa8CAzgBCc8KgA3pGwdeQ4EB1gJn/wEKiwEFswMDBhJM5AQBFIUDDz0BFQ1zBw3gGQQEAwVe6RACAisHCvILGgyQChNTGR0gExmuBiIvGYgBDJFzAhUJCRoBagOmFAECWQ5SDg0IJpHSMSD3/ZbY/RL2AgaILQEnsbXyLzPhc/IxlXYDU5Mfnojj5ihThHCBmxch5msdAgdU3cogXENODq2UlAfHAQCFNWBZikmgbvSKsiidwf3ADG2vE6htWQZP6fznkl+sgoqPRPkZKsctMkej7zrOXcuKZwZF+CHt37z1xWK3zCC2hczE8q9vK7DxrlhPzvFqflStmuksD9foa4z2Z/xnSbzNuHZ0Xw9+v/Mx2kfxNe1W5M8XM/v01pSf0qfCoynxs2wVgGXO81KjxCYItWc5VcTQrCB4ZIzxCk5WLjnNxAJOkonGYWyFx+X+eJqkfaH6K/Iw8q8t0ll/33zupyQmjPRs+2oVDO/WY9rUoLthjWmqVUvdsBFWqGDP/V0DkH5fo/73W8UKTHk8hPCCo/K0lm6vMXBc/mxsnAxYqrkmMv8+90v4LxQwINWtQA/HpI7PuopfuwZFxckL6gGWSE1KKzYLg8baWXuvrLzf7hYkPTUkpEYPuLUdFcb8HTF5VH6H6Bc8VgCsdjRUKZj0KVcdkBRgfXbuuU9wHt4AzdPZwauS6/3NQNbOWYN4WAYoumO1yd/TIK6p4I+x6hELmaG08XuU1V1b22UrsZ1KnCze5kO04PvjsFJKhPflwVTuK8AkeGNyLe3LIS2ymz4HvPfKpYI5lEbgZq0UeRYtnWtQvFnKumIUx5Gb3atbdMoOw/lkIDGod3sJP7v3FcM5Y2EYZP0oO09nYHmuzYUM/XS7FY6NPDyVHBEVhNg5ZJj60BjB8i2HaoW2HMukeK1w71EyBPuxXJBCu2K/9Jg5qDNcW3IEvVGmk38+XTBkfUIIJUBGE4L/oF12vsksx3krvfWrkWY1os7TzZcRktRNwbk59/W9vmiPfGirnwJhdQn3h0URFeM412RGyvIKttCYzE4+rhfksybs1mCsQG+1GU0X3QvDoGr29PsMT+aTNBvHr/uFyKnAMuLs3nsUkPuRn277g0jvpO2vhIga/qRoTokqJtLd5j2COZjO2MVOgnKbQelK8B7Aw3mnLw9IQpEQkKZH992sVsbm06/UYLbsqHz7nVAsDkfu2WMDWt18nYUwty9ZZnF3TKUbVXZlNH9oEMg7j4kgsUrWkkeIDUPg9Pesu1M8KhqglHlAKs6MBhrmJoGzhcQWpCG0bfLUdZFumzLKKqJJAfYVIVo4Lt69jrAzNuEteDnjcZlEBvlW0DDiScoPSo+sqeSdWU7QvtEl1b20uo8QS6Jjy11m5WDhIY4B9FKMjGR1grtmdCK4wk9n03sioByYc5f4UCFvhLXuY+wBnfUKb5+xpnDusAVRWu6CrJekCpLdPPI+1v7HFIYXxR8T8QiV1Ke1LUvJzJp8WbsTgh3Hfjbiwwo5Yy7fwLWQoPODsAAQZCKQcgeVdO8lbNSrVeKjjbik7lLeMWb1fxYiJoNSNgOjdfIHy8rrOhY0ia5K+9U9NakiB+VhftDXpVNWXSN0Ya22Lr1NpOloju8hH1dI6Zq8XVDngGfpG3qLZx34Kr1mXTH2fI9yV6kyDGrmhrOjNxNjvzUDdQ/u4lnEKqXJtxSLINP3kgYqWN8sWLmj2OJpYa/9tzU+X3o6M0CRgXR6qwCJpg2WvFeBxvgfzU4YDEZ9/LfgG1bQumfq0PSrSbiEhFuRHB7L2swDrli0MJQT6sShrJN09vbxDNjV1BiPCFVumxpbP0HBTBpefugOBnqldLD6fYFxtJvtcg0F0Z/OnQAG3qnuKaLe+spe2P9k0xtIuGMzdnD2kpb+eYzdS3w77Eh0CtDZsqz4lhGZXYgHuo68i7LlLwTkPo1mFhtPzqdooggernAOtIWgljPZ8/FtjSBbIKn/VF4k+SUvTEE/5ZrfRzzQA2dY5jS+eUT4iAZ0qiPTESpRnP9JGI9sCbjModpH5H3ySxAKfyVTpMHA2AIE6x9h89keJVqyh2RypAA93/CoXtaYfTMK+zC87qaaOlFYbwXLZunqEpVd6gwnqq7znR0Q16D6wG/lbAPFR/OJzdwNVkcYjSK3l5XoXKT4LztaH/NLIczHfuUrmyA5QaNsMqtiEIxc+L29FY7uvUfMJVfrUQvM57Qg4xGj6N5SbCTMWLCNOfHcin1wvpEaU41rI8HWgSTNTyE8YW0hk5ztoi+0IpDJ9xpPBS8gEI2medEtkjmT5jNUtQgkrUOFFL+nZsBTQ3vtN+vc/8LYf4MGiYGG+V99mOeX9kXPTn8kWnnpOsLbcrXyG4icix5IBMe5xAv+MTXF3Sq4krQb4RzTc53um04Zhe4GySTDbXo7xhjg4zoktXV21mNpQudsdgg8g8m1EFzA3G42xo34wQx6teu+K+Kyc6d7ZJtz/h1hiWyn5VhKcKils584iHMZjenqtMAaGYNvd6Gk571kDYaPMhLYH8c9+bdGKfgrYGF4Ce1kzMZFYs5gZxwpA9txof2igIB7zolAiye8JHxW9682n5uIL9I6zPjPPzJ7gTTHS8a1DIZcXAYIxoG+2rd+zUen+Kl1Mki20p3X/dvVe10YiIQ7MYnZGJ4EQAWirvKcEurQU5mNDMxF7B7T2qmiMY6Ou+XXc5jG87um6hulSL/r4wVTvNb2Rc1hGialrJz2fw759w0czxIPADOc3qbSbwQeta6NpVi6Dc4ImCcaIE2upB3xeo4AmR/fFtgh+d2eAHtOpqe93TTn2FYsJvsLhLkrveFvF81oQPZgoFY81ueyX2MliPLe9QStRUI3d7U8J0qJCKvYbxhEp4vkncdDiCHf6SyfP3llZOnPdxakgq3h7ShbWR8kQuhMq1iUbur4Wk37cx91rToMbT+dSqGxqcn8Qb7ZjVr1GYY+pJ79daLDv8SQ5eHgolmievdRxI88w5WcegiTFxjgI4X4Cgr+4T8HHlyfcGxoBVpJWogdDOVu50+mA3NAR2cpZbC1oEttN0CGIW0vrdfhBzbJ7XyEpXSE8BtDL8CGm0uIxlC3Ox9OWW8IEgEIHSzKWUFyWovoANb8e4CaZ3dpvlAbu75NNjnxzmcfBH1lhZ9BEjOhUxOWDXGNhz3KNzy23KOuQsBNw6ys+gsNuu4jKkAQPgJW/4t3kpU/Qfm2KcdpENHm5ENiiQzKt4agy38OaPcwATy+Mck0K6uUpI4VBGRZagYAW5I3i2LkXHyGjFijRpMUlyU3Bsu9y5wHBYNyKqifz2n2axlUXoUrvwlWpMMSXWaQFMMVGRQLyup+eJecL3l4mvp1N6Dz6lgPAs7R0KNwT6CCxTVobOAqy4/iI83PvnkRGbLcmvbC+kz+SI8fQz6lrq65SeHrNeCDX3f7dq+YG6DTtGTW+78+ILq5K17drnMhN84hqijkwKapiQvQx1CAILQL6DXQiapBevvGZmhYnlEDo3bmWsjBAQlLBUM5qZT3C8xRuGiTFSvxP8hdfB9TXgWUKjw7RA3bDNK7WejveEdS0CIe4WorMOB47r5Em/5jLU5a+GxpZXEdInFyLDbW444WZlXZhmf8H7YwTM7uhbmbrqF0fnyyqTtbleY1Kdxogku0+RfdK/oJ8TfSY2PamQ4dyD+Vtsx1eENWaQ/zTQ4sellQtTdZ6SmKXAJwSjSovY9p6dLk44IcABznNlHTJrtzFJtKAPYxVYEYa3ixQl00+Oi7Amaow2Pko1uWX1TExdXAd6jtJWBCmt0IUdRnsIfiAIwDMM2Ryy3R8VrHnlG/Q/ykdzkRW6n6BlHwQS7ADEs6lH6TUAfU14fTwMqztXH5HGEACunczr1+IxNSgbjMC2Ad4kebZrheddk/8SlbgTdoyQ5lK7cP8VUcUyxukOTplge0JyhyZc6zWCkMwg1mL8+FQiEMBORrVrR7ohuojMQi/XsP5zj0TSwWACFL3KDjVm+vo5B2nNf2BKkgwZspGg5lMMtsthynTKYb3CRRD0a8IQrQhXHy6kfPDRBbk7w3owbdEI/HbDQOxvwAmwfYgAzwTtBh5KK22sIq2HaoahA0zMPVr+xC+BI9bdDsGaSU5gTDhbXrNh5s3scxQv6fDNxqDeNlvW4d+AqiwXSwXpV2+AHzmMZQXcBRrDfyTo2gwlLi/0CvAAdPskJ4W+NLoNO0z4YwLOdgrowsGTa5uCmsGLbXdk2tlEHzJctCVTPGR/Q67OPSfBoZXSPYkBobk9ANVVwhiTEjABjFvn+ZG1//NdoAU4aUJYIRHc0ZisrOZw4Gf5WyYibEHxIoN63Y3TdoYT2c8mMaHFrK8t9mqF8o0M443Ex+CFEmepYI8Pkzk71u2gyUFc9dPsasuBS/01ScgbY1mWHrVASfHZxHyXvjWgJMUxSwT0Nsrp1JKFeBj2fCf9X0VJuiIV0EmBEgNtS5j7R//xu0b+txxYe+zjGo5Sp5unz91ZvOan83rLWad6dnNv3Srch72Bpi0wd+VBB2MZpSn5ysTY477znjNwcrH0T2lcfFfFJ44NQXHmSJTqUOhEERFckuwAIekKULulxPz65qKlIkOOFpgmWb90d9j8RiZ/DCAbEpbJZS91AiShW+jcWTiXE62xMx+h2+KtdHiZWxKxlvGMyTpf9Zz6HU7bfp8C+Yy/do9l77grbZsslnJxnP/nl1tukYgwXRVYvozFRrDZ6gJDcGltWCK6D6eLNlXkZbmbQVbKwz8Wu0urYZt2Kz37m69w9eiWWlC4qkN7nmvQKH751xGXkosB4PU7AMGLP5yVWuyAYeb/SUcC+XlpndU6WVynQJI7gGCBE6EGsrv0TaGNiToQqrrBZlGs9w/XhGXNHpx0u8L2ZzOQB8kiUUjHi7mGtxT2LH+oqfdXCCluIxnJcPZZLqBZKBZjt1sUCjQpTlHsG+n0/+G9s+/BT9mpiC5pe0Y8AeSE1E/2COXADWpm2TzvpqfrHrR7QQPNwHUkjIWFxUAAAIQAAIAwQgAJoBJEEsAGAACBAABIOAAAAKABAKACEBAgAgIQAQLAAhEIEAMAFEMBAIAVKCFBKAAQCgQEIAACQAhAEQAAIAEsMCACAAQAAoAAAAAKAIEAAABAAAAAATAAAAE3NpbXBsZS1pY29ucy0wMS5zdmcAAAATc2ltcGxlLWljb25zLTAyLnN2ZwAAABNzaW1wbGUtaWNvbnMtMDMuc3ZnAAAAE3NpbXBsZS1pY29ucy0wNC5zdmcAAAATc2ltcGxlLWljb25zLTA1LnN2ZwAAABNzaW1wbGUtaWNvbnMtMDYuc3ZnAAAAE3NpbXBsZS1pY29ucy0wNy5zdmcAAAATc2ltcGxlLWljb25zLTA4LnN2ZwAAABNzaW1wbGUtaWNvbnMtMDkuc3ZnAAAAE3NpbXBsZS1pY29ucy0xMC5zdmcAAAATc2ltcGxlLWljb25zLTExLnN2ZwAAABNzaW1wbGUtaWNvbnMtMTIuc3ZnAAAAE3NpbXBsZS1pY29ucy0xMy5zdmcAAAATc2ltcGxlLWljb25zLTE0LnN2ZwAAABNzaW1wbGUtaWNvbnMtMTUuc3ZnAAAAE3NpbXBsZS1pY29ucy0xNi5zdmcAAAATc2ltcGxlLWljb25zLTE3LnN2ZwAAABNzaW1wbGUtaWNvbnMtMTguc3ZnAAAAE3NpbXBsZS1pY29ucy0xOS5zdmf/////AAAABQAACPSSQYXQQyWplpgTkhAGWXLAjGgCY6W8E+OQasgiBlLrGcZQI8GoN8RYCLxXWCkBMBbJMRE0FgtIwwHRBiCmvMbISC6CIYxKTD1XHFFGDbdEjCXIB8NDwChUxiPOsRAjHM0Jl5gIcpA0hEivROCScwaJpxJhQYLg0ogRgQZBQ2+RgBhiRijT2iAwBjhQhGwoV9xxzAT3ghhKnLVWSquYMMwKaxQxmlGhLUYaSqaF8t4iKzz2SmyDMbgESjGo1hIgkZkR1zqixRdASmMRd94AsTFoVDLBmaLKGHBFsMpZUrozlmqHENgYSASsGBRaRyAkSIBwgEPCUlGS8I4SwpVHRIglLfcMNCIc5wKJqBkCmjyvwEDeYYQBsQ5JD8CxloNtjCPUMzGFts54IyHknHTCGHOQaqqIRJ565gUjh0gJphXLco8sVSKI5jyRoEPELLUMbEGmI95wbYUU4DgBLWFWKsCRgFZRo6B2UhLFEWDQKgEqeB5055igwoFivRZaQsKQEhQgYUWRiipjxbiicNAlp0I04wUkE1zwBTjKCECgRwJiACYTWVQhgjSAI6ugZwgZ8ECGHotOFRPGKU0x99ooywABnwkxioLGUMMdcFxoBjVXUjtQkfWENG6hEIUwgoxmwmFCBQADXCSxsGB0ycTlDjIwJmdcM489RhpQCcgDFzFJiQXlePG41FYrUpZWSkihRDcKWuMQ4+AYoIHTYDkHMWWEYUaCFMxYBIlFoIvwBNjMO0KVpRhrpSDIGBpyEUfMgaahCAxs4wQAmAEuDqUQDOoBCMoAIBaRnEPRnfMMMkYMqJZB5cCARGwuBrNCXCQVeRg8Ryn2pAlmkJUSGocp8sJYKwjVkGGjCLiiM1Eh5MZghjRWnmlEPSAiI2CBZGKB7Zy0ijLtIcBYgCCa4hIokLESWGokqQDRIyDApQBaQi1gWFMRCnWSEaghdxiTBBEnThnqkfVYgI00gVqER7VxBlJMoPgAMss4+FhgDbEEBRAtKKIkYuFENYwRKCUA4SIPxhWOiyctNaArxBQi2mklCgEcgyiws9pjhpzHElzwBZYQa8UQ1EKLYIn3xiokKcQURA6Y1yBqEZkHREvqCFHaQ2MNlQhTiCUVG1QCMoVOVKUQQ1YAYBSmlmLQpWiiGQcxAKEbBqYy3EvrEfYeeDAsI9AYRgk2IICJMFcYjKMQEiKL4MAGoGlMwPhCYSNCR0o5MIAIDkuoQROKO8wJVtSDTy0oIwJliULKC4K41uAp7KQ2iABOmIcGTCCQwU4gCslHxhvKJYQeTAaYNow6AITwVFwiPBjIE+soRwgbqjm32niRtRhgOKCIlFCChhAAg4sDNaDQKSas0hwTD0qAQFzmPRWGYeQg4aQKy6xi0hHBQeZAS6a9lcZZ68H1mlmQLCNdE0gNuJI4igym3lFkkEcicsyIF9sjYJEkghljtGWCEm2l0Rh4hxVAWkAPnKhWWO4hUo6ADao1ggiNmdYQOC+kAMSIwQHiAGCBICXeEU0sIgMrJqlDiAExPXKAIwSgcxwApQWpQhoLPaIMUCwqkcI7pkC1whilxBBPScgZUFAsIYUYhFPklAHEEcQ4IFIiK5YXC4hGHUFUQQee0Fpq0MAGn1riQBiDSSwit1JhBiQIngArtShdQSpAsdpYQMAAz4HuuNBQLAWx1oxIy7CFnEsuBAZHRKws4xwkwgV4kmsnlkMieomcshwA7jFSXDAFDGNaiFI6xxg7AiTl0EEqpQGlUUWAIeJDUbQgICmFrAEQk06hFSE64DBxIggnsRHYImilISA8ZJ2yXHkqmdOMQuG5F+IyLpHRBEFlMUfEknGMZQSCIQ344mCNEMDQU+fAtVYcYgUpmjpFQTdcIimRqFgxy50RXjznwDaYKkah0Q4UCjwAnxNAHYCeOoo5wIyISrwXxIohBonCiK65s1hILsp4HmolAaAUGS6dV6BkTC2IwGgksKTUEvE5VsIqMIE1JDMgorMWk2IdNRAAKAkRYCDngISGJKTB5+BQ5ojknCiljBjfckyFVB5YrbgCTRQnqgIcNEyAglZEZ6gSkRqRtfWMg0S0JoeCICaT2HDrSaLIQS/IBeJpTilRzEOPRSbNSYkUJcY78SUFBwwjqdJSgG4EMohKQoJVUCMposYcPAQAAEWJqQmEYIPMHLOMOCOQ1hZQi50Cy0KEHdTgCKyQMZiKzBgAjXTxoQORai0N4l5cA8AzglstPmMAIey0R5YrRYU1XknvFbQCMOQo1hwQ0AVXHhTAoDNggk0+EEVRKDGw4mNNGBlYO1FCh+JA8bDHznOlHELMAw3GKFB5hCDh4CtDFNTKQOW5tFhpkDm0YlIPvvTWgiwxxNJgTogC4iJvLEYAWM2As6JShxwQ2GIICeReUy6WQ1BsjZgkForpQJdWGIzJ1pp7KKXo3gHKtBEAA6+gloogUcHDknjIjQYbWYNFJ1FQg4DQBmQwAeDaE03E91I5IJHTTAIEJMIGSKAxRFwJzRkgGHRiGQYUYWYNlFJCq61UImkHoXfMaiWkpIJoQBXSklPQIScECAMqVEhA0QlFTnIxGZMYc+ahoBwxwbAIFlJGqRFEcDEG8pYgRahVJDhhwHTakCgQIoRMSpjD3GDvvGPCc0PFgg5AhK2xWlntKGlQfCIxABN6KRQoVIlLLTfQUyKyaNIKwqEGFksxMAMiNM/JeII5STQQyUmkhGZEeCOs+JBzZRlg1BEFgsZeC+QY1YRAxEUGDUuJuRWKIKsUdkQjEcgBgIDCmJHEcweRliKM6qUR24ExjthYASe1Q9iBBq2jBCDoKNYCUoolRWRMSojmAmlvQGCOSUOwI4A5gxhSBHmHLGeUGwS6VmBYLqqCSnkIlYgeSAWIUmBYcbzXhlrPIfDSQQmw0UgSAoyQQFjExRFfI0ERJlpCyJRoQFRBtQceWumY8coQr4XI0DvODCdGGMDE2F4qysAEkQuwoFaOHFE5BAE4ECZFTiRjgRGgGkCEkBhJsZHGnInkoecKEqkddp6MCL7yyIMImlFUG9Cld8opsDACHGwKROVECUoY4QQQygAAAAAA";
var chunks = {
  "simple-icons-01.svg": new URL("./simple-icons-01.svg", import.meta.url).href,
  "simple-icons-02.svg": new URL("./simple-icons-02.svg", import.meta.url).href,
  "simple-icons-03.svg": new URL("./simple-icons-03.svg", import.meta.url).href,
  "simple-icons-04.svg": new URL("./simple-icons-04.svg", import.meta.url).href,
  "simple-icons-05.svg": new URL("./simple-icons-05.svg", import.meta.url).href,
  "simple-icons-06.svg": new URL("./simple-icons-06.svg", import.meta.url).href,
  "simple-icons-07.svg": new URL("./simple-icons-07.svg", import.meta.url).href,
  "simple-icons-08.svg": new URL("./simple-icons-08.svg", import.meta.url).href,
  "simple-icons-09.svg": new URL("./simple-icons-09.svg", import.meta.url).href,
  "simple-icons-10.svg": new URL("./simple-icons-10.svg", import.meta.url).href,
  "simple-icons-11.svg": new URL("./simple-icons-11.svg", import.meta.url).href,
  "simple-icons-12.svg": new URL("./simple-icons-12.svg", import.meta.url).href,
  "simple-icons-13.svg": new URL("./simple-icons-13.svg", import.meta.url).href,
  "simple-icons-14.svg": new URL("./simple-icons-14.svg", import.meta.url).href,
  "simple-icons-15.svg": new URL("./simple-icons-15.svg", import.meta.url).href,
  "simple-icons-16.svg": new URL("./simple-icons-16.svg", import.meta.url).href,
  "simple-icons-17.svg": new URL("./simple-icons-17.svg", import.meta.url).href,
  "simple-icons-18.svg": new URL("./simple-icons-18.svg", import.meta.url).href,
  "simple-icons-19.svg": new URL("./simple-icons-19.svg", import.meta.url).href
};
register("simple-icons", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
