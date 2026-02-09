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

// iconpkg/mynaui/src-index.ts
var lookup = "AAANv4kZCjoZAgwaV0qhkFkBBlJTRTYxhmNDVYSzU1VjSEljd2M4RGZDVmJzWBmlyFYWU1RnZUdFZiN3Q1ZoRCRCMmRHVRMnSTNlJjU1cxV4MaZEZkRFUmZ1aDWWF2KWczRIJBRXMTk2Y4WVlVRxVGdnVkZ0ZSJMVSNhWnNjQiM7gHllRTRUkVWahnMyNQlENkdyR2tWU1RnVIQkRUVGRDJTZyaCdHRxUyZkc1RkFnWnVGZJajc0JDVVU2eIWFZHhWhlgiREgpZyZyRWhpI3hmaDazw0NYZURkNTVCREaVRHRFZzJFJTImVjdBaFmnNBZlVFRVSVUaObRUMiVVZShDYjM0NLkoNFNlMxVjNZVkZUVUg2yUIRVlZZAiQWARgYBgFThQQBJAUDBBIFzgEBm0cFAQYUZKQBC3UCVTWpAQGDAaUDDAgPhgENAxppAVIRtgWuAQXOAQK3LagDykIfYZ8CBQ0EBSjvAVt8gQIHAwM2WAsCigHvAQEDfBDaAaMBBAMEAgIBAwdRgQEwBRkCbuYrBQYEDVIiAgIcCQQpBCTVAQIIqC8KFSMJARkkAxdBBALSA+UCzAEFAWL9HYIBARwqxAcCywEErwICKwSVAg4DJgUaAQEZhQILkg0B/QsFEc0CIsYCF9oDLz4NAwIGTxdDAeI6EiUBGeQHGoECBQQDFLM/B+sDxQb7AwkSGwEBBTiqBkYB/AJ2ogG4AQGCAQEjAxIPAxYDCxpPUN4WoAEuCA8oFiIJCBUesQQBAQoBBAYSBwEUIwy3AxECChJbGQQCAwEjAu4BDgcBKQUNnQGEAe0hBjE8ZLwCF5QLGGoBEg0JAxwBBgEIEj/wAnScBCEaDAUSA4kF2gEoHRsZEQoRAVG4ARqbCDMnBBiJAncC1wWzAgh56QFh3gEDSOQmhQHoSQYMMQIN9wMWIxALFQEsBQMJAwa6AjAHHWIGAQN1BgIgAgIEDQIBISEDBQvfAiwGG6gF1woCtwEBCwcZGiErEQQyJZEIKQHZF8SxAd0KHwEJBwUBBREDAgQLBq4IPQEBBgsIVQG4D4cFDwkyBwEoAxocBQSMCC8+ARoBCiMJJroBGlkB4gWpNwMClgICTwJZCjpGBBaJT7VvA9rS4eFwtjY52+J/SsLvz5OCLynyGIgZ3BGiTkpPIItldu2jrheoWQClFLqjQEDVDs+LsJ51ZhyCUNPFppu4V+ZTsoKR4mlZpWLnZx2B+p8MkFi78a4smJS/0dO1eWp1toyfg/TAgdB/WlSPSAXWf9GEHN7xBhT9AVQ5Ha7XDWrfh/fKdOliqW0Vx/mwUM6G37Ncl+4kiAW8MOX2GsZx5cEWQ3N2QngCFOMr0xFibRjPZKVNeac9zLPIPO2DMhGhzwnjvzurih+/2C2lP3wxMXucGrTi3yq91OfkRhHghDcdkmFeeUiziDUgIDiob1VhntHEIN6vAdSZJbCze5q95HB5tvTvxa9zAZB1FB/5Ws4DYKYpQrmxD1Wtp4Lf+xvaLvjnzIm0twb8QTW4ruUL4r0HTd3R0JGjCcTkCr1Fcptm6CkFvz8QCnBHMdvMe2z9XgGHOTEkeDAHWLDEUG7jNfJWEI5KSHSZ9KHuYtCysw66OQnxaRJAB7ur6wNJFzbfAFSfJe9syAnbZ46U1cLxpyM/nucxYkJDEw6YFfkkKKaOqSlgUlcf9oye4zgYuWfYUxU6WFW4QQf6axu2p1hzSiyz0Wsi+9dRYGfFvkMYCnPwRJbSV2NxzpyOzsjh2mNd1vsRGxdKO89OzYXR4/yEjtAchDTnXSomMsk++MJsp88J0ryuFcgnEwVvuGSkvIHCxCYJopTCKJT7BVMJ4XlmWMlwppP2LMCid1hpcd3mmDHR0WQWRlRDq/VqJ4wegabU8IE0bAU7r1Ngxm7iR4tjCp1dufn7naVNc9LldVLTk6C29ZmubQfPonNbVMDS5PR2HlHqP9nwChRve1jarM7KtclBTvfXHHqUwEYznreCYBp5/Al3ap1MF+eksHVvbMMWpclvB1QycwjlVgJ+hjU3RfDCB06oovuCDeXqvf/1PEEOD1Ece+wxwzI+Ub9l/UeO5m6HbnTNNsx3JRobmCT3oISFSXrnxKR0bdhScN+tFgLkYZMTPE1HgBE7nuFlu2tpBY42Y9E2f8hSCBdTRoDJdxoywkrlYeRkGJD0e9PWEA85jLLSYpcjLHaH/yTg8TKfjhPvRXCQdZ+WQqhifbVFLqT6OsKRv2hV+hlLVHKnocTgzR73QUdyyEPGA7f3piktipiP+Be46w97IQbHbBvG3HiuxhrXGS7xvVKgBWMesOuTcC6IT3AbOIz3E18B1zZjKGXTIIdZNknVvK3h2a1PzfxHsE8Tf/teEfTaZ01gJAmQ5Ab/0tJi3eJR5uP0qUknwknZIOevpbZrZN5vignTMK2DLWTm/iornjdLWXz3BfgZgYxrP9ptjMAOqsfZdzY18z16lwuKF2kV+qMndCBackrRjSzjsPUi38cBFGJd7JMQph/McsuPTVU++Z54TmNHrX/y0zf0ZaU0tx+lZbzGoEIbARmi8IZYLM1oXA+RAOAVLPPhMFLBi/1Ul60/RAKJiAD2XjT9T2jou/lG2LvlUXaigrISASl/KyjxOCg8rP+28RSXLWorYEB+Fwrp0p6oLgET2P0yLY65OnmtUnJY7WP4a2bymi70kWuXGK3X5h64lYanh2aU1hvnUqZbO6CWXvQbTb9AERQIfDKNw6WBldQNk3+fZC7z2fkB3vcVd2icxMgXuB/VXC1pybnNjrACyZcq0H0nJBBE4p5V5G+zOmmI13O+sFHjFvfdJdV/2V8nAz7yQPS3Z6sxUjkTPyw00JNkyk7xsTYGpxP0zbNuCrL+LhLGaoMdAOp91/oPm+Vv50gE4Xs1MZGu3pyF03k1z/vY78+I3LL7myc6mSy0b3tGzawqyFPFWGeIvauBtNVif/CfcwGbfqRYpNzI0Q5EU5rolhNK+QO90a3xliUFpTR/LR5Hz59vO51pm6zx+HgdviAExH0SZ6Ct/wt7Quub6CXwIPSxF1Lp0R9mtMXSde3NxLQ/UQI2zPILCUXVs6xQgr5AdrUTGOLew87RuVZCySQ8+V2xmHpdOm2nB+1Rm06gX3ygeJEPMuamINOozpvYX7sBF2NLPgR3ntzo6cxz5l8zfQhsxIqU7mUBqa9RJSa1EZq6DC8GaNt+L6PW9sftowUn0XBde5KLcuLt9GIU9/3jgPRYLU5tz7L13g9MfjziFK7C2N6SfziHhcxwL3Reo/SvvdElKDsPdK4GAUn11XUuKb6Kw0e2rHQF+B74lgG5QtpHiJoelMMNAiwCuGts/zt6t09W4rb9BWpoagzkSvC56CYgzTCPYmDI5lPowlHofYuEDSgm0gSheh1Ic58uGMPHmvboLIoYkR2KFECpBAm6QzL3jukfvC1H9qh3oHvsCVVlAjf5TK2avqRrqu91IcPol8qaiFEsYz4bkJkYtAqT11NP9B4WmLG8wIAso/18ayprq0586GNFxb76tb6W78hOWHSTG7W2hN/wUJlk7JgY4HZwnkL9ZPYQQnj54h5QIkSengU+eWC/rFoy39xjk756Yq/6tI2wEDkZdusmWUCotaKOTDZ0H8WcyjUdhnWem80NFFwDNqfovqMEm+NjmQAi4TIfvja0k4CKfwj1B9bIGxokoHz0zHIz8dqlBQTEfB2WnI4An8e2+NkYGxoIOKpHYRknpB7y//0mpP6M8/13eafGCDKbxfJ6UqbwRulOJLIdXMIp1DtwkH+RAz6Iq5XPML2gwbCKvPbgKmOOA5VsyJWV3k4T1wemHMq6tY79LCa4YrP1l0JX9X0etqYXeHs/4dT0jLdVrexqO6MlJCgLTuyF3BDdyrRVYHnvGi+9M9L595kDrO1booCNHNZo8iZloqC1/WxnFuMicda1ts4Nqd7HRhWs2XZYa0MB+DAJZx+50ZWC/OZtT4BKMLTYcdbfbzlIzzd61dMhiEiUTbqTtrSmADRViaRGiHvNEtZSZ1VRdg/gibxGakiRH/gxHSHrHLnp+efyEal/ULfwMaT1G/YX++28MhkEJy0RCqNBtLdgqMIUeGkqBzV0eijreNmhI9o9k78JWLlaCoPt0NR9tJKkgRX4gugVaQlv96EfgNk2ygvwJnecTAwT5KwfpIg/pKGVlXIFihK/b1FCc7vVDYllQtM06Uwt2kgb5HM37dgbTUQYlf4Ct5ajNRjjkjrTArdfwSNNkBO9bDjc+/J6KcCd0Z48khlePaoQ+gYtqrCMdI6+7KHsxNWm5p6UFGVEI0QMYahKvCQr2yGd1/0N827lgQKehZwX0qjPCuX+6HOSXBAV7vIOc49WCmBYDVD0074ctKXTHdP7D++aoAK4D3XHfUc2kEAC27kzYAR+Oay4Ici5rEYuB/B9Carfml3eKDBh+tE83+yyPIMxaO7tpwH8tmu2EX/Cov7N+HPVQBz4GQTVFRQu5XDME0ZUjRmOfASJd/NjeT/nW17kW3nLXioFLvtwdTUCvjZbct0gxnvpxOGOfRd7sIcJ6J4ASgc2aRRBy0N57mcGKqmo63ITYY+1WrIAzUK1xfm7XOZp0VhCQQMAhACAgIAAAAAIgAICEgABIBBKQEABQHAEEyABhEBCAAB8BgGAAAAIAAAJhAIACBAIADAAAhFAAABISEAAAMAIAAAAAA4AAAANbXluYXVpLTAxLnN2ZwAAAA1teW5hdWktMDIuc3ZnAAAADW15bmF1aS0wMy5zdmcAAAANbXluYXVpLTA0LnN2ZwAAAA1teW5hdWktMDUuc3ZnAAAADW15bmF1aS0wNi5zdmcAAAANbXluYXVpLTA3LnN2ZwAAAA1teW5hdWktMDguc3ZnAAAADW15bmF1aS0wOS5zdmcAAAANbXluYXVpLTEwLnN2ZwAAAA1teW5hdWktMTEuc3ZnAAAADW15bmF1aS0xMi5zdmcAAAANbXluYXVpLTEzLnN2ZwAAAA1teW5hdWktMTQuc3Zn/////wAAAAQAAAUdO6YGhTFwIoK3RBE1ljBAOSFKMSAGvEkYE4uLUBaoewcEwYrAbaw2y0snpJJ8Y8aJBxWhRsy3WEoTtlhnElOgUIFGTHQXJ7ILwQBV0iqheXokGFyLeIRmSQWjBFFiy6ckiMd1gQlmEJkBKAyFG5YaRLI7h8c3IT2po8QDW7ZIHJQ6BZYbuhlqwkMpRVqYXRonUQMQYraaEHm0s1JDOogbhLnHZ6Ija0xiahWMVl0mUiu4JovEgRspWcV7ewdhgUBscohZVmkccoBMCQuggVW0o4CaxDSLKVOITBNmo7OxmSvItau6cwAFoSmRZBY9C8CKl2DBGbYYKRsLJbhZVAcmY1h4cqE6uSeRZDUnfHOVRrTHWbdicIS4tCklxwIxOMqYWhigGsuBy7B3qUJHiidzwUcVEqbIuAlXCxUakkuVRJlzVXzLk0pZMSkmicFKusSBBTBRE8gxVnBSAgsCmgRDomdWxLKAyGUUuSeXw3mc04pVBWEzHJU0EMh3x1qsQUTCSnesakgyhiURK3GHIwe7J6WTCmPAhSwFUbaA0FJcsxEgkClmGCsToEA8tpHDYmOjA8MmKmOyKJfBwyN5JaXDxmNaDAcpkZFLWrqZpXA2d7MHPKs1BnepKK0MdoMGeUOAFJYtQCi6FZ2qMilBeouzSwvKMCoLKqOmXDYWpBxxoEDGSiyIGWIRTFh8mAMEl8msQbaQAkmlJJihQ3JmQko8whJjUmusZChBIolgGHqHXDdIM1EGowashjt1W0aRC4CYtCQcSSdAgJmcUnNSlCYJQGADFaJEiMQXULhmHAiCpsicYTF4caNcg8kaO1e2AVVUYZeRhCNaRcKWiWpXbBBcsVvESlGQprxFc4dowTunJaeRxSrHpzCXGElkMUu2HGZBgIaXJBEFdZioMIpQZjNaisxzUAaFWLYhJUUEWwqgigVlBnp7h0Y4N3vFahLKGTmilLOUhKl4EGF4JQmJvGNQg4tSmSRKawwJxwlSxMQCqaGHxIhLW2tLlwgLkjGnoBelPGWsRKAYtQFcI8gJCmQwG5QlLFuMZ0WCCmkEsrzCykWzVVhrhreLpKWlE6A1QNenebCScihiyIkgE4Q7E2YUVDhLFCCMFQOAkbi1BaismwaMtFOQeYAUXbB3UsGYM6VzuZlyaTE1Zzu0HGyhe5FkZrp8u6ysCDJmeFZVzEEysqJ7JoGDZSlRSLygXFN0WWulLEmDx80zgzx7YqVAAIQBN3RJu5QLxMOXuKELh8maSrs1YUJUO5YWVquoAbwruYpXZnM2q6AXoshIMlNNCsiLcZakwbEQRguiB5trmmEUN6kaFcN9ejBgGEUDuVbBRSQjgnvAFlIlITNckxNXfLExTCIEm2aLxkokeagySDa1BkcsCWsBJ8pqwyOaYjkAGUWUxxPGTAhzWIWpc1RWyBc4OxlLNscQdmxzWzwHqLVDumSsMqcVuEvISyg7enJVl1eTKYWiQsibxwlMIYaqyAR6RHOxa2gpp5GQgbxrk4lG0AAjerWpIpF8fDybOkMpNzFCd1ZkmnCjyVqTDJIcBoKiCHJ4ZjhUVAd2ARMlmSBaacy5hhVsUycpEyxmGzAoCTHKfZtTiKO4fCTEGmCQnDtyZyQHpTRHsFK8qpk4JwyQpblUyWKUuUF3RIxMx2CConmoOrdEHLIzJlU6CFmhyHNIu4ZsrLxid4LMiRkHsWkGCiw8RqcCvLJmdhyyhqymQlS4ORlYkVsAGrySWqikGQAAAAA=";
var chunks = {
  "mynaui-01.svg": new URL("./mynaui-01.svg", import.meta.url).href,
  "mynaui-02.svg": new URL("./mynaui-02.svg", import.meta.url).href,
  "mynaui-03.svg": new URL("./mynaui-03.svg", import.meta.url).href,
  "mynaui-04.svg": new URL("./mynaui-04.svg", import.meta.url).href,
  "mynaui-05.svg": new URL("./mynaui-05.svg", import.meta.url).href,
  "mynaui-06.svg": new URL("./mynaui-06.svg", import.meta.url).href,
  "mynaui-07.svg": new URL("./mynaui-07.svg", import.meta.url).href,
  "mynaui-08.svg": new URL("./mynaui-08.svg", import.meta.url).href,
  "mynaui-09.svg": new URL("./mynaui-09.svg", import.meta.url).href,
  "mynaui-10.svg": new URL("./mynaui-10.svg", import.meta.url).href,
  "mynaui-11.svg": new URL("./mynaui-11.svg", import.meta.url).href,
  "mynaui-12.svg": new URL("./mynaui-12.svg", import.meta.url).href,
  "mynaui-13.svg": new URL("./mynaui-13.svg", import.meta.url).href,
  "mynaui-14.svg": new URL("./mynaui-14.svg", import.meta.url).href
};
register("mynaui", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
