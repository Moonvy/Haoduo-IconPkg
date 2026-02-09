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
var lookup = "AAAvt4kZI8kZByka7UpvglkDlZNEKkkzRCMldFN0QmYyRaZGJUVUZ5Q1RkVZaFRyoFNElHlTU4VDZjKGRBVENCOlQjWEqCFDN2N3hldUZWRkNUN5KFFVZpZTM0VUZUZSYYN0U1amRDhYQjdBNFUmJjWDlidEVUNEUVNTI0REQ0RCRIhEMZVjeRApYzM7WVYjVnc1NlRklHVkhUNFdpJCd3FFaFYzZSQ2NDQnFyVDZ3Q1YyNUFIIyJXiCNZOVdqW0QzRidhaTNISWI7WnqChSRTJXFGdURDOEZmQ3ZGNlSGM4RlN1V1RViTZZVTUoFWhoMjVRWCRFNGZFVjhGglMmcDdkZWd1ZbYywSVmVoM4KVdrtmN2WIYpRBREc0KFgmJFNkNBZUZ4VYpnNGtkWFRiNzI4czWYkiJXZjRURFZJSURRhTJ3dkSTYzNUNlpCVyNlg1ZUaXOHVCVWVHQxY3I3UyZXU2FUM3Z1RDZJeENUIqOmQkNnCUIlM1dTaJhZVnYxM1N3VzQlJ0JDETZDIxdWZCN6pyYnaSZWJTFHVSZkxUOCRTYnUjRCRWglZGZVZ5g1RFWCNkVVdCVqVBcmUxc3XDEkFVSGhGSUaVaWlmbFQzo2IyUyZDNjOzJ2NaRCeFiHdLM0glRSI1d1UzWHNVaVZGKTYkd3EFk6ZlRiliVTMzhHdoRUdDQ1VpZkZHFSVLhlBYl0kUMWJZSWRlQSc5JnU5YzZTM3NodDVUJEVGVycySAZDdIZTNmRUU7ZDRyVCZVdHZ5Z1RmRmZBZCZoRCJXZkMoVUQ4VGNTVCdVp0h2hUVSRqkreGqDllc5ZmZilWJUGJRHJGgqZ0W3JmhlR1NkZDRlQlRVUaZXZlQjilQ2I6YWVmNWZ3ZVdGU1h4R4JEQqODI2SGo4hJJJVbModJZEFlg1YWZ5Roo1V1ZEZHU3dmR0cjRiRWR0ciY0JEeEZFRSZUdjtzNDQzZDcCWWNCRURkU0J2YVWDdVSKV1R5RYNEl3Z2OFNoN4hkcVLEVVVjZFMlVXlEQoQ2N1aCYnYSQzdmpFV5N1cUozQnZEQ8R1I2IjkmFXQyJLM3Nkc0ZHhiSlOjNHMyWVRFOmlGVmRkhzg2VnYypWUmY3NkVzVkM2tjcyM4JBNkOIYTMnekdmZneXSTJ2RHhmYVRUY0ZUFTQhZTZyd3IlJjmHZoQzJBRJNEMnJWN0NRZURENSVDk3NFZVVmNWJhJ2VDZThjQ1ZUtKRid4RZNVY4QIWQdaAccBBwS5JfQDBgImAgc1ArcCBhcFMwdtFwECFAoK/QVOAxABOhYIItwCVQGDARlNCwIHIiDCBgoBAsIC2ggDLAMTBIoGlAEBAh4GDjzJBh5vTQKQDQcHAhEBAQFMvAsWEwcRswKqAcQiCpgCCQR9cgm7AdcEDBoCDAULPg9kJgIKAccEgQPKCA4ODCjKAXfiCAMPAQMCAgonKAUNAz0MA4oFI54CAgyAAWoG8AMDAZsI1gEE6wEHDgYEA6UCzQEyAQknbc4FmAEGFQ4BGAECBAkBEA0BBQgCAxYCKQwECHdjFgoPpwQBIpUG/AGwFwEHOAaDIAijDA8WEgEGBD6VASQGJQcHHgECDd4GHfkBBgwmwgcCLgkKA3kWCaQJsAI5Bwi9AmMcARPNAQIVBS4C4gEnAwEiD30aRBgDCC4JAioP8AcBAQQBzArYAqsEFAIEpgYBtBs7CbgBFOQaAQwBAgEtNPgCAs0OAgsEhgIp4wEFENAnGo0G5APnEEsCQAsOAgHoAQQXQgIZAwoEAgZ4G0UFB2cBA5oBDAYXHgIFqAGWBAM8BDUFpgEaDQYCEzOuBS0P2QMaAQIEBzARkhI2AhcCEe4DDAQBIB0JLA8DAioQ2AcCIgkEMQcPGQGBArsDAQhDXZUBNzsHDyI8LZkCAeMlLQHHAQkQAgI5EIYNMx8yOaplA386NgQIigivEAEJJA0EBxEHBjAYAcoBKBkHHAIBCyQQPiMQrgINICekGB4mgQICAZQPXw4BQBMHDhZ7BqQUAXwFqgbzBQLmCAEqMaUBKwkEGgQVAVfCAwPFBQMFDFwQqwICAgMuNMECEQ2OBQ0oBQ8EDFTpHiMBXAEDCSGVA8kBHwYFjQwSAZ4DhwHQAhAdHAwUGwH4AQkFLwEwdgQkCgGoAQwBHIABAgICAlXNAicbDRsmBNsLCcIBXwIDARUF7A0/NAIDAxG6BTu8AgEBDZcBMgGdAQ4TFfoCB00FXQkBAgEZhwPgAqwCAQQGHAwCFwQfGwQEBgJAmwGGAQwdAsAhQgv4F1g/vAMHSQNJEA0CBBEVIGgJTQafhAEFF/4BBSIDFwEEDQEOBbABFQ4CcS8eNQmbAky2CIQBNgwDFQYGuQJOBgEfCzsBBU3iJjkIWV0BCQlYoAEH4ygSDQYCAg8Y1QQMpgMXNx3XA7sFGCJCkwGtDFblCcMBKQGPPAmmBQQiAwMeAQEBCV0CCAETyD8CBAgXeAYFJZEKAgbjA0uJAjQYvQEjcwGolQEDYxMJJAOTASZKnQYGEQQUULoDBgFhIwkbAzcTD1zCAf8CAasBtAKtE0rlAwoSBC/PARXTAxkDBAYBA9IFBEgQiAIaE4AFBGcF9wEGARQBCw0NDqEBC0UZATABDcwGggETcxfCDrsEAiX8CQIJxQFdCcgFeakBAQ85AREBjQQ4FggewgG3AwYJEysCDF0DBTzgAQECLSELBwMFARUdzgIDyAEJwgUJvgHgAQngAgYjCQMTJgMB5gMIBSUFAhsBK0MIZRUD2QF+gwTIFs0BNiUFCCgCOAIX6wIFBiIw1gGEAQUGyQEohQErAgFoASoLCwcKCwUEAj0DAwogVgoptQKRGLgIEQoIOrMFDyAhAhL6A5wMhwGaAcMqcg+4AfkEDhkEFgMkezwpqAwlBATEAhK6F3sJC9UNQcMBAagBFAQBC81QFQGLA9kBAwRbAgMJKwswAgQUChAEDA4d2AG6AhyHASQKAcE2CwIfJggu7xkwE2EHZ1ANqwE8LuIBeB8OlAIfVAkDKQ8G4gIpbAYLAs8MdwIBVAR5BK4RIQYBBuMBA4QHtwMCHmMB1xMWAUIQwQcBCEqrBR8aLtcBC48JygEwD+sFtAMhogEEMwUBDAQ+A4gBkQIFcCUERAFghgEaAUETDgSkAQSEBJ0BawEXAQwERQUJjgoIEAUCMRO/AoIBA0vnAsoTEQIDBQYCegEFHlEFAUojAQEFCAcIChAMBAMyAlORARzABRiIAgIBHyUCEcQVIVnaBQUHImYCDW0BigEwyQIBBw6AAhQGBqoFAqMBKKECUwMSnyYBAQdzKUUBHQIFNgIqAg2VHgIXNQIFEAMGEa8BMStdMQEFAXyKA5glSzEOMAUCsgcB5QIXrywHAwQCHwcWBg4L7sIBCLQBAQNWAgPDBgRfDRHMLgYEAbIBCDAIBg4W0gIPIuQCASqED9AECgERCgI1AgTLFQEJByuHAdAgD8cKAXo3EAhrBAJRBvMIUk8HIAVBjAgzJzUFA7cBNkgIA2McBAIEAQcdp1JYAQQBAwGIAQctAQF+bAcFBRb9BVpUBBhxOT984gL5AdMD1w8BAogBPRwKtANoJBq7AxEYAkleAxMEAQELiQFFAaUDLwMMEQINigMDyQLeAxoZBDMDAg3hAwYBAQMFygYgAxsEtwEMCg8FDAMFMw0q9AyiAgkCATMCKykGFgNIGwkcfAzIAVACFz86FR4CLtEMBsIFEXgBzwEFgQXmATQBAiYmBwIEswOyCAJZI8nuhZI2nI/qetOuBKaE8fTCKc6lEoMDFcTycQ2UknEyzHQHZn0/GyJBOhX7NjDlcgy6QPW3QMbaOgpzhRzzdnGFuURq+qd5VD3wP36+Fh/MganafBDnmMyRUu8VxV19m1CNICiN37SZ9hDsJ2w+iWrPtMT7K2eVIee7CPLgCKqVLAHkqJ1lZNT7f1RHQFcDL3KcONULS2QZNKhhdJh6tCiG7Ny0wNMEPdI/rx51ttz7vriFv0ZMP0hoSUUHCccfiv3K23/HbwxxuXDU91kA/nn8VYWTfu7ZfaRakqDOc5clgIAH1C+llAx22ksaDxmkVMEeTqdZ0KjSOPznhFfVa3WAfLM9runfID/0Jsg4OV6G21SiQ9v7bLpD57qG/DhIyc9NX1oDeh6mRKMu9rrgmgglzhgFIy366+KQzUIlVPeLHkLSk1rU6D70YznAOtQpQ9uQu5LHVOr7NoC1gWVJD1M/b3lJImUXGdaJD7co4a5QTdpn3bJmLdZOvpk0tTEIMmqo54JupcMginVNGw7rKK6IvXpGqQ55i7acKn36kKVEqNojljsJAt+LpjJy1HJB7dfTuHyjsLm/VdgYdd3dcAlT87Ml9H1rFQmJpN4aO/ABUY3GIFvBu4wBMtVvZ4uePlqcyC1r5rqn+Nl61T8zHpYnk40tm+1Om5pIBgTtxxDEaLqDwUTK/pH8OkoRCaKIPImFB3ObbXlf7o78iZmxd2shCNWT9lssIT3n7UZ7u8+HBU3AOQ9VVjSpOEdChLVGBvZYon5mNrwblg9Oujz0h8wUm73PbcVYPW+SHTsZzZfgyGOuVdi3exySztzowVKFi6phNUyW5C8qilKN8pMf6lcDWXOLwNjmvuum89MN2trCFO1CIpRjy+8B7H26JTgbqIh+0tWQIv/WTA+pWgJzu2Zt+WAfs4dWBNdO/R0tnN2ijgWOGBeunDQtZAqSAhzQn2ooAtpDOW60FQZabVv0J0YwoCKa5pnWUr+nd0plqBh6Zns0quVEjmqYLyl+ipdhXeAdh1noLpXeWdkmjjKUad0HefqPHlI/AmvcX99RlMN6L5XPCfyDFAx7JPCLQcKRSdkLHTnIAkOotGNIlOgENq8UIbhOJ5WgtegF03/olyXEPrYR+5wUngLXVxhbzrE99hYhkSNevahHGKd3kThURbdI/cqdU8t1909RsqzM3HMYAjsIbO+aBmUviwcLX4WheRxNhcgm8WjU4MGyAcFCujA6nywFDe87ZbNUKlPAaSbJgHR0N800EvhzIJP4ffd1LbdveizpwZnJHqRg5kokyV//rAFgXUmmCTc9j6J+DKvWWkdZfA3vtnQ/rq4QwOzd0j4j6cjBJ+Fy3IAW+/zw8gtTeORwHjiAvhmQ8HQYJLm+EEE9tBJMdn6yTeqKABy1ar4quqRQ+x/b8TlySUprYE7XioDNfOfyIkFKzUrM6SFC70IpUkZWrCfjvTrZELaUd7NdqiD8KpD9BsipHRa7g19U2E/9PTkDc6Xy07ax6gU0SZO7fzUVgqZ4f8EGH+B6Aq8lmdPLEK9StNq4to54IydO6fCZp7vz1dnnLOomDzDa8KZm9z9cFow7aophKMKgpjBzVaddmRgd8+5IVtLIB3JqUxB5kJYDzpf/LLPnWNHG3TDfXC8VtStu6HtNIMCCcYYw22oK9Q0PDuPrZDm9h6yfkawPcjFHrk7PwsjCjlSFddwrm/+VXQpZE13zhMeW+8F5VKkHSvE7ljALCTLf0UAhQ6Umi2EX9WLFeTgVL90yYJh+wNnwl47PW/afqLTkUppTkXYXFgQX+DWOzhyWF+8D4mi8yCWSad4jhv7l1gRtqoKcfykJ3NFFtCHHoS/GpLShv4JWsyShlU18CB3Flz6MQpB+zot0Xcfd4HtAHspew2zPoxnxIjYo0KAQfF29nNiwW8rbguFXvWw+sA+DXVIf4P4IERii8psbG62AnPugaldC5vadUvRswX5YIkQE4XgkxmKhjClR+Z9zll0o0lzX+ZIl22gxR5r2rfTD+oteX09plFoPupucsa/8Ml8jGp1XjFQTvrXTcmpI+jd4N+7o9odppHbziC/3jdhSqdXK8l6kjCmGYsC86l759HCcm7pJ4kSWFBq4qvoyhwhEb3O/kAuGtlQZaK+5wnN238jdjF4/0I9rmLhMqqQZSHXK2KjVeO4R1Cb6s0kT6CQcUkFVfkF8GdmVNq0Kja8jOqlDSpw7q3ueiNJPqxEcvWpp8KTxRdxBrQ0opvE14/80B5njLPL0Tek70CWZSbUhH98IsQc14QZKVHebzT3V4y+H8b95dTQXs147pIo/GI9ZUsI/yCt01PvzJ3WY9EaFF8hEBBDWtcu2pnbfbG74EA0XNlBDR/q2GJgbpApqkrt1ccJkOvWIJX82YLEteCn77igL+OysfTQmfK8+8gyeMBDrxbTQtAbnzGXUx8+GsGJIKLOf2MsyQspkUvjBHaIZdXz/8DO52y/iZmQJ+CD3XMbLa9IG9Xb+IP5yv4+teFamojrye6pqCv/2g2b65id7O6geebI05ascGWdP4peVSGHjf3ePHW5P5QR3p2n+trFS5sA/llQ4n27g86PpTQXvfY8SzKRvQGlbtTwbYrOQ368G4xlOfBzzeUDVAZdEfumeCRUac8LliHF7s51qFD5QGTxrr7uom2C4igsTC/L6XbEpmpPRKzNUXY42FOjFo0MTZJhY7kbNfZOfSklmUMIX6voqn4MQ3D9VMKHeqhvT8qgkF8ArhSKTYecx14G56PJJRAy7J3CrY4Ltdh50fn+KQOzxpfT1VddNj1Z8CD9b+FzrMiTFTXkOett761mJbDfZMRspLkWmtMiNUutqIKbz4AkA8A46HPZeS5J5EC8ZYAVR5HRQPqfhTAoOFQPILkXBAm3E1gVHy3vyyVwlL1TjMRrQse8nR/5m/ZSGG8m6kbnkTskPOQNt+vkkdePuV0Ya/tbO3YPsPCrOdxmdKQpb1+GT4x3PLd69J3SakeCN+W2vh3wEELmSCavw+mW269EWQoP10tMCldqii04p9/+Cw6dwGxN7x/6LM5NeyA7eHXncxYKWHIzzBPy9/1WBOyTaH9tQiJCOFmc1+ylBXwuOvfA6jiqXyhX414u29OT1rYdDCCYYLC/+dDOl0+RBv2kfnHQGv4RWn4ARbqDXMCHqbkr2/IYuNhJo4hYAfVOFGUVGcgTShUJaB7WNh7h6e1m47r4PMdih0ZSx1eUsd1DBwnp9VtvR5pqcgTg4J3CLXP+h/IDZaxw9nM6heC+gVt476enEs0UsZaRgo++/Vi5IpA6gFXgBOKjXZ5SHF2d9mol9MGRiT4wbZGTPqpM9n6wN9g9UlEeze/cNhpmO8DIz/AdBIgKVWE9KY2O3oLBN8fK076Uoovxu0lUKAqssKhhRN5YaZmJArIxuCty9K4fCFQ3yQlB9NDWqp5Qbde5MA6g3Q/CpIHMSOK4AGgD+4mC4JvXYcokef+8lLBbPx5Il5IQzf+VUGe64CJzLziBNNr0y7bPNRx8Vk0l2dDPI93VNnIX5CaftWo9b0YRRLQa512UFRGVR4c5bs9/WAlGXhL93HSh0jBmdnNCUl0NiG6QgTmlivgCZdhpBvroC/qiUVae9a0IwJcyixR3K8S5NOaeiEtz1nuvTsIZZ0Bf9VY+UMA5JWoh79z5YRpjk2S9nqUDfYHfWEH77i780k4b4+fBEGPWhVk11Flssc/jjG1WqYh46YmopnrlZZZlnvaHbXWmHjv93pUlFD04dwGW3QDMFiaSvf+lhgstw7zsmmvNsfu+6EuprVbDS83UJ0Cj53jXJkx8ydkB/HB1/rwZCTclJwlM+KQPnC3blu8W7VZZo0PRTDklNTnEEvH0eVSV2LZ3VNn30dXze7PXUqfisV8j7mHzRgcnSt//tDmn9J06atWpntdaVabgPFJmsw+6p5FlvHMt27G4DlFvfvJekWAvUMnUb0k5hgxF7mtQ9n+ld2oGCD6Axq1dQ/J2P6fzuM5NqK53pW5NOz8Yp3QC02m47d7HvdleT15pheDYYiG+dScUacCA8+DCSNYutvjePL5TQeWupt16jqVrs2XvIUXDgrJYCrNTvWrScd3kcym8ksbYeWKefRVhf4INrm38gfkqe9rNpVvwgiW0WGFEEdBsN/E6rjK3VZzF6s3KM4GLQpYX0oR2MECHvCFOUEN8uw7GDyGvgYn4cTWMM4ZBI7v+SkD0sjiSAxRTts9m9vphWx2TdVfvOWsDCz7rTCA9mKli+T5+y5Hn+TIQeZtXGGCrS4m5otx5rng0B5DsqjjdFFM7Req0YZNb1Q7LzdNdbWC+8qgcdDe7sb5L4VjLpESwibckfTXryrrUbwMiZbrxqEVelY7S+2LAAxWa6wi+QDJl3Mwpg8ubblQAx+N5dh+ITobvujZbaeE/beUI1egYDwhTPoanCqHpzaSaEEjcpdBP6hYv1BMRshqfYHSR7qKixjDx2XPAajLl5sghz16zc4e8/rlE8lHlrfHNwsJE0khag87XCPyo9IVXOH0TbZArBR/3yg/5hKxJgy++lZZ69B5BPHOXo8PCELSvZRrWxfMOygpsRjAVkJrCL0RwaiqQLeU1hghAl3igTm4Fyo6CsBNb0XpjJFdvQ7BAm4PgAd9gU/F2vKUJJWUr3nsWkEKtWBndfSekNDilxkpK7uD+r4LL1tcH6z6l0D7GQBmm4rCpxUm11oeDXzHjBqSN3aqDiay3GccyL4ebWnbuUGuWQ0lVrKenE6SXBoEb6SKGNoBpq7H0y8JXvkWrb/uJbR+1Pp1vdohF/TF2L91RRG2B0C3Y6Co1n0gbF7L+2VW1mpXmrjkUgIxv/TD53/bkHSWvyRG+bwFuQOI/TbO9A9qJileA24Owv24ozCDI6wNWb5nqf5fJvc7UYinvZRFLVnnP+aKNsvgIbRZbcWntFnJuQVMFDDgR0vXlO5u/+1QzpQUfizCtgyCljUkJCXTyqpIMJnFiO8AEPjF1bBDiGiNl4+3OY7QMFM/JEeJQGRGBNEiP70JtdFeN3bZ+H+Vy2G+TDS3mtg6/CFHPD3Lni8zxxdQvkfsiyojWxbReA3ROQfHSi+pYPrTeSQ8O+N6cwMs113BB151QA3DNe+DVJhlzFivtdf4mMcY+iyiaXrGmoEsL4d4cG1iWprv+OnUGczodl8ve9R+pl/hkE3ulL6RNA0OBgPVmy50UQxStNszrlAs9PbkZyXMsRrAROTracG+/9EQz5VOLwc+0edaQ+rL8+ijfuBKvHdW/f/iHY6YtI5g+66qsqhXmZBwEia5hkDSoXv/KO1vi0lIVotbjqgvJF93XmVWo0sutRAMz2EyJps9D+ZIhX3yLLVCss5XCO/ljnstr8iawKGBlAN61IbbZ6Yde8EPrcsHp7UfR76PBoMGKvATsimAUAFZamOEsLKwD8nmFIsTZzGKGjVhWEbWqKVwZr5Z0KZx6VpvPvknpwIlQd1RDMgjyRyiQNCJm5GDan4U+npt9dg7TWqCLY2MG8csa7ZGZg8Q4jZCHbucRrDAOLxoVvAPYYFL9F0R3dkpTDs2fQf77bZdv1ZLZVybW6ImHxnkJY+NADkXye7biYSU8i3+pMnEZqWWSXSAjYukJEI1is4GsPmqpRhrRe/MxMq9X+FGZy+G9pfo6NHrpktnCdNlILUOMwsavHewzVtbqW8oxbjsfiMBra98IA2M3OZQOEBco7LeDmLlQvu+K17oiCNooAwNJqgXmigtsT+OFUa3eRHAoU52iJpmBbkNrAnTulPoXK51RGk5GBR3OpqsPHTHNRmKdrKAROQGfea/zNAgA6rRfEX+A9LNcAdhzJtcK6v6hCAXrrZVXeKkEoabjN2Sc4h9Q9zPUI9CA0YhND7Omy08FqUVzOHwsfb3yBR4Lus34AzMXhrPu+jk4wN3ueOGS8BcimM0pygJ9bvhVYpxYVOaVMmXWjAFPqPyTRfsZncZ9TdlOt3GNzQOav8GLAoFzNDuxPT5a3439OCR5UyCtxGt6/T4jvRYWPzxQk/kHOmcgmkJLaqMlSsg2uVVD7QvHZ64rI767bg0P/aLmNES5X7Kk0IzrHXrd2xkXVQg2aWI+EtCIZMXDVRLfdUa/je7nEfKdzFJVYO+Gt6Fu5h3TPgGiNNcxYU+IpdXKetlzX866pNIJTNPhbGrf+OrqUXf+gFfNrkb6GO6TdODt5HTUOlyKjSnB9O6HrcyLIB6+QKmRrDITLth7ysov6NNdKZkUKrcGV19LhuyyiILRXhShuAnZPKR1zNGHdhNUOAZwJv8UQV6VNVdNaSqsfELbycftwu6xkSLEKbzIXGJPM6cz7RgDPzbRlmTLxepoFy8UIoOvHRR+EFZanxF5VVFN139W0llImoxoaZEwkIoAhVE0jAoCsi5YpYrwGb0HNM0Hs8SFhlr96FxC+1m9aDa1Hd9gbbUgi6rkbkRNgV4qE5jpIaB5fx55GIUs2zvAvDKDIz0TEJZV7an7UDc/cZ1e+7IJ6FuJNvGO7/l5W87Kzt+r03QE7oOyM7hc+jvgTNapSHh7S8f2dyicbtt7KVWSSiEEhJvy1jMSzuM77lm3KE/s/r3TLpTH7lK4FRT2/NhLZ1eYwZpqdTNRX4IHJrbaEM3tWhGUHuTOF3IsHnBbbgFA0pjAWq8glXbVizsjfQ438QB8zBXfrjOFFhtXsxoeo7I1L1dM6JeuoOU6iILVKcO1jn3WQp/7sKs2pZnSyaKhOjh1Sd2Ry1quCW//h2N1zDrcPqqxUkP4DdAUzFpwuucB+1GcBOTG6lUzkiWsVE7n5zH05Ba9Wb2Aa0nclp8wVQ/00RW+RpNMznD71VfQf8lga3/sLgt2SXfgznKZklqtEHRIGwIbP/6HJtlKkkfTvepmoNNg4fUd+DNlluZeRLhYnsI9snC1atMMDUhsAArGTKPg8jgduq4QWaiOVzHa5vdSnDOI/Whqj9OJmJQZ8grhHKnQUnsWdWiy+FNfM5qFGuwM6vG/vvzIh+9BGrLtzKVVr8GujNg+dCdh+9WVwfc+tGu6RAJthunWqBXjSma3sbzCvZzgCBeTHQNLu1bBW621el5bgGs3JUYmC54e16xjsq1RzN9ccbWyGLrE6Vc5sAdU6Aj44ZIJDR/Tpay0QjtSo8EgCvUSwIlwGHRAQKcZQHd8/dEMqq/iufRw/sFYPFvb1a493A1vvTIMEHhjv8P1Cc4JaVh2tj7LGamrrzeF31aLuBYnIuLq/BB9Uwayt1mUIup4ck4nT+9l7I39AhvPU4ich5chjhu/JnZNnsokG+f3r8lyBa1OpbTtZREl4WC2em/5sIYWBMVB4LC097w2+HIgfbMTiWcXtX+z8HZ4TqLrvT3JkY+5yMkqqSvQ7dUhE3JfsgYey5hB28oSpsRUlMUQZqF7YqHHbTCd2uLOL8pkfts+COkzKhVldq33h628KU+Xv668ht5AEjB+V4bHYWM4cwV9pc4v+/OEpa6JxB6bqJLxXw60ElJyUTiK28bZSsWS+la2RZXllnEh13bl1Ep3VvGStmeZLb0j6qRKKnbHc3mhIpt7zyFXFe0ZOfbSUuYf1pqE0pAhUBgee4GC9NaKITvwMcMx1F6OdwUgNaPbyATvjqgpsv44WpCp3MAu9wBoLBx2lDVsbEhjRppNCX+/qO0pxqp5qe+jRF5Gc9aara+xWjQ7qzQ7HE5gE0y9hBoc0wjuzpxi9SYkjZNc0WOagvfqOR6m9tKigHh/xqv6BGkxJGvSg3laY3thB2X4AZr8yNlUzwXU6qLysbI0RFgBCqvTfkY3hQpqFVMKATozqQRR4ZPaiYDyLXjQj2t5+tU8uxsCAtwclRnpHAUjhVXRWsQYVb+LetUCRWyG8Z95l70uGf59/IEQ5/w21rB4FSMT7aO459ejnUERSPq/Kc1h96MlO1j4Q7N/u7JD6rPbW/A+xwNU84LJoHtLe/FXdlQzmJUsiO+Mi2zeWVXpX/56+/hVPkbZ1uBi4PC//7xMU8o96/LoFysNH3dxCMC5Ve8Gb79kVIsToInC/0mrXV7KGKMLMjlmgzyHkoDeux7B3gKNYRFJP0LLwOZ1cydVOCmmy4lZk5EybB9xpuyS0IjOlcCR0yOkvJAVDEmmHMNwJZI3iP7+rCiKOpwNw4SMbCzR1vtl+LdmzazIVrxFK+c+1LOaJDF0Go877gD4yonOX9wHzDjqZ74SO7fUyYZj8o6A6vx5FBqvEQLXtNnK3AxFC3nBSFWnVhqxdfAfgk8ZLXG/SgW7uzi3LtvaghtKuDcuQYWhAjrXKQ09xwtXYngF+0/DV5Cet1O7KS0esbLkfIhKnBZkzB0e6T4h+V6OUv4KxpGytU+v9LIcbzbKdw28LTh+UCcYW/Mqar7Wrh15GVAUKCnkhHxvwA8CqlPVNtf7F6Z2MqKucVTFlohFnpCTQQgXLLY+AgsLUlxq+GlcOO2s0bJkZ/7kH01u3WqtJe+SPSCh0ezVUYmrZYthuIT1E5kzht+XjiMo2N98+D0L1yLZqfuN12YON2g1lOTXFebrZojJrLuyPY1PvCAIzoDIkrAXxa4HdiDnmrIJ2kpCcOxA+u0vt0fQidrV+h/IzxM/5XGfEkFjxPQnndqBPnGfaftHf0k0knq2LM4/wRpgb+n+oyEkceQ+0BI2S4eQFjZUL5Mg2vqE8LbXtzU1HKqr8n2PubXUZtowI8MLPbjkQh4QSrAeDC/ebyqx2GLhMXdOjWDOBDWFJwaXeJEAXzm4n1lYJtA8hdhFyUN8dm6+rue77Z7+gC1ejo1tYwqtuoxlTTSmbmqTGSdCU46tksSvo6aNBxnpSRU/VdN/xCO6ZWGiyvXM/36S09aPkvsPjOxxm5Qa3ui4Alx4C5GGhgC5B7d/t757liy5tYWkhAML05p9Atl3SdobtyKOROMmjKVS51BdX9jU7S+ns3CncptT4XDRli4jbxxdJ3azk1mBt5+5tgitWdF0uDeJZ8OeSOfWbxjjKKVuP/CHRhyM6aMv50EEyZ77SS6NBPjVh9p/GnFOkcV/oWFHV5KJnCxIjIiSausfRORDWwET71Ec+5CZtLenWoNg/rXV3aYOgALDZpwJ9+RltdCXmqWVCU12t8hX+0NeyeoUMJsM72cAw7pdep/mNXaxiQUpTri9mmQE/Ga3ucMKZbOucy+KLU1YHVO6JWVq0uqIQIIvQR1fcXV6P5zKIG7Qo7OudUftTpMtlgn8Fu2dVeuhX82XXe/qBfAkHbUBMqzHRJXnWc5+KYZHmkYvBsVEffXE0rFAch1Fy5sXL+1QkaR3t4/TEFM+CvXCRkWUPrESdaNpu/bn4Izmk1kUgeQdHU6LEziU9FdfqHlswWBWfrhZtMD6Btu/eNxENB0XdfkXH2PyhTz5Z/mWcmNCZqbQjxOOHqltgoyp8wb+lMi3LkwoiMWa198h8916xBbXB2Is2RFZXL9fmOiXq57hq3UT+5KdXmwSJtqiNC+UWW2oxQEXyg5KxZvyJCiBzEi6ZZ7dX5uYW50vt9XGO9HqhbaJMaedWyCrFkDgvdTCW008mTJIV98p+WV/omtKurYsqTDeBGMQmnK1giPRE3CqdDccmS4uvyufkwZwYMPCf45tC9oAg6uL04b6dG9kHmeBX04tSu/OP03ymhVms9sXwA8ZTtndDblL2WJbLX0XpZJjFxdV3Ch6MVgaLVpzr6WM1WDoR8QMbePTXZNSl3LUCwZD4/ONO7TLX2HMgmX1cwUsVF53aWOP5U/aIKNcOjlS+3kR5mlVfS++8uO6L6mdqdL7qsw1ytEE7b1YmN+eqx7mn4yRjyj0wyz0AhRYRO+3QgKD319MUG1fMFXiaeiiB0tVqYTR33gP4lWvkSN+p0Ki9om/3aaevBRw3w9luYmgpd6JAZaU1PmtP8mQUeUJpOLRXUsFxQmun979U3V/tf3Dih4cV3hf9cgEOyMmHFg6x3RbGRzvn41EmwfOUZs+OLpqSMeodkgI1WXm1En9TCXO5jupCjmAabmsdZkj/99W8VhbZ8b/BibwGtRAP5HwFNiyH+Xv00m19+03+g7VJzhi5u5Uwpk/kY75B/ulY5vhqqn63LGNhyn9FrW1wRdldVX4LEYEEJ98B8D9S6KQdH3fIHr1YJi4TBqUyRANPDDct2HLIcdXieTR5Ooj0nZBmruSjopeRvRBwSxUh6zCil3RJU+afSt/Grt6BjDGj/4Qs1iIFi1LWYlLHalAsoBRCJW2X7HnQYHOyiOX989QG/y+XDud3dDucF2gKhh+ia1Djh3kEuL3DSurDkXmSt3aQO4O149PV9Bcq3XxS1tJwbAUgtm8ULK0P3x/bnd/HAVBLFJZu617S5I9lLDaDakiTfmeHgTl27dpHVZt6O39qwySgIaSgZu6Pf/95wW0WYfzooaDS4KAs1B7XSuw9M7kwj5ymFAtVzbDdEa+LlozIXkDvcaQGseYN70pMQyA7HoZA8mgaB8JrMkEftt5uahXrPXjlKTOSmsoQd2POATNO1MiAszx5Ud5N1Vn28qvM1PPz6OpYLQ1jair5XSvQXEvKS8ndWHQEkbHWXy1Sa1jRh0kh/Sou5jRaNPpIWYp3HA3Tni9OiFrszNQE/t6l3LwhoYHhsbRS+f0w9HS69zSr3fC5NuRa/h4rpPWr+wGgAfmNYVgVevjM1JcC0WVKJbp5ShZV0IryWxEwyEEImlVS6SF3kEtDQo2D6tkzsMIBiMVvUxtEQ0QUZR9MMh4cInP2TI783QW/INEk1fIDHvVmo1S/hHVF+j+zT6U72rkxHC4icn9HuynqRt9vHIG6hu9mNS7PhwnQCmIGc+W0hOH8IMh8zuaTCp0tD2YAyu9f+tiksJkaXWd0Le1T5T29F+vXjwrxP9GGJdnACVMJUS8W1og/GPykpiTBd1mQ4pCrbNIGHVWJnXHZEvI7eVcYmcNhrVLucCaGZ6dXZ0F9eKQxHoGQDOyvTlqOd7SyzzEe6VeA/2qIhBiw0MVS8U6SYoNFtLPtRhIemPQYQBfdy0iX+78na+djb7nsb9TGGiXkZFiZBt7lZQ6ljj3Ziy7VtVuFs8qRcFlO3zrxHJ7skYJ0YQYBzOTFAjSCbgVeSgVcNwT2kU2QkGRA3cXM15bFdru4ZT/lBvGwFjiVifYNlXLowAs89GH4r1IY0uVbCM06iT3t0Lq3W0eN5juUhBo1XLIlETIDU29kUjtylDOcFlInPjnCpX6vjaGdist8SJXrcvf+1/Vs8Ms4Nla7tACxMz2U+teBso04dAOrYxkQIs8JWjSmakAiqDnqzoaW2WjdSrVkWKc02PIH5hG3Sk/Cf8NpP6eskm7fuAOnRrEMl3UNagW9B79HcYGlR5Gz0g8KvdomRGWdlllSJL4JWg/pY4zRarURTziplbhKyHLRxyjLRN+S0cqAJxb/901/0vU2HFIjXZV6ufLCgoAejOJJ9+Q51nuToPTmtVwaie5ny5M6un+q8SNgy42bT9qPHQCF9hN9enm8HGDGZ4vC1rejO89kMCNJqutVLiDBoVRKj182KoxF1z5/a1co62PX2DpxjOXmdjqGgnFmnHAraX79bvj/mDKf3wFokPCJ3SRIz/ZgFG2L/MhTWq9GxKaErVUUs2hHCnckOQL0nZYscVYS58umpWh763IWGxr7wlKuKTbbEti2rxAeLIF9W7R+r+1PvBgFhnSZfX13HJl8tNh8JAF45uz2e/Gqlsrha5Eb3pBeYu83Vxd0wux3oBbGqhFG0QhJOPFrrB83n2AWP5xq6sDA5obTS4rlk4f3M5cNKWiNLDTKoZiqCQlgjzWMoVV/ZOo1XTq05WV401qoV8lh0KR3rMY5l/wj7VG5klrw2Sx4lIUnyRyr99aWUUKWIrVCzWz81qXf7XrNl3WMQ6Y77/F7sYwfLWFWo/93KBzRj0/tOnUmq4MvETXbW0wyAASctthbTUg48g3gYcDlf12VMgqzDUn0KwQlPRvi9yJGZOkAjvF3NNacHQMqpI2GZ0o5CgcH8toZU9Guv5AaCG5UfYGN2lrQrxl4vUvTN7SX/AZ/JNLvPi0XsDORu+frMcQRWNDzfa4fDZKK78RozDa8Zg172YgKANvLZyo1tDmCoVPpyU6Hqh3gL9XU+YIfPWW19+lgu1HkpRco1kBNujP32nCG9StRrbEPBoY8OEunoWwOU9Nqjhsmb7spXgCgP5Spj0yPLWDwxo+aJzORnv8jETCN8FjmIKJAAAAggAQAxDBIwAkAABgAAAUAGoMCCgRBBAwMAQEAAFAEhagSgBgQQAAMICCAAQAAQQAIKOQgAAABAAWEBAQIQUAAAEBMQgAIBCCAZAAACgEBAQDAAIgTAAkgMSgICpAIJIYgAEAAoiCEAQBAIAAAAICJAABEMEIAAAAQAQihBAMACBAQBiAJBAAAhDAAACAABkIERAgCABBgGETACAAAIBIAAAJiAAIAEAEBAEEAECAACACAQAAgIgQAhEYAEBQAUTQEgCACQAAAEgoAQBEhABBACsqQIAAOKGARAhAOhAQAIAAAAAAALgAAAAlwaC0wMS5zdmcAAAAJcGgtMDIuc3ZnAAAACXBoLTAzLnN2ZwAAAAlwaC0wNC5zdmcAAAAJcGgtMDUuc3ZnAAAACXBoLTA2LnN2ZwAAAAlwaC0wNy5zdmcAAAAJcGgtMDguc3ZnAAAACXBoLTA5LnN2ZwAAAAlwaC0xMC5zdmcAAAAJcGgtMTEuc3ZnAAAACXBoLTEyLnN2ZwAAAAlwaC0xMy5zdmcAAAAJcGgtMTQuc3ZnAAAACXBoLTE1LnN2ZwAAAAlwaC0xNi5zdmcAAAAJcGgtMTcuc3ZnAAAACXBoLTE4LnN2ZwAAAAlwaC0xOS5zdmcAAAAJcGgtMjAuc3ZnAAAACXBoLTIxLnN2ZwAAAAlwaC0yMi5zdmcAAAAJcGgtMjMuc3ZnAAAACXBoLTI0LnN2ZwAAAAlwaC0yNS5zdmcAAAAJcGgtMjYuc3ZnAAAACXBoLTI3LnN2ZwAAAAlwaC0yOC5zdmcAAAAJcGgtMjkuc3ZnAAAACXBoLTMwLnN2ZwAAAAlwaC0zMS5zdmcAAAAJcGgtMzIuc3ZnAAAACXBoLTMzLnN2ZwAAAAlwaC0zNC5zdmcAAAAJcGgtMzUuc3ZnAAAACXBoLTM2LnN2ZwAAAAlwaC0zNy5zdmcAAAAJcGgtMzguc3ZnAAAACXBoLTM5LnN2ZwAAAAlwaC00MC5zdmcAAAAJcGgtNDEuc3ZnAAAACXBoLTQyLnN2ZwAAAAlwaC00My5zdmcAAAAJcGgtNDQuc3ZnAAAACXBoLTQ1LnN2ZwAAAAlwaC00Ni5zdmf/////AAAABgAAGtdaVKkphFVVa3gCSiKRcYSZpRnocWmTUQ3jKXZYIEhMEU6sCUUY9CwFFQWfFVVUBZzKkkKrpxUlgYqHYqaWapIPSCpfaiATF3xAYxkBeZJUhHgqWI6LRkUPm6zmRWIo+STe2Y1YRpKN0q2akQyIpwhS+m2LkESUNpEd0A6X2DiUMAXe9jgEY2haZjYp2hnJhpjDhQprSQjbun3lwZqGegpLSQ5JtQLhqT0DiVqk2k7oaSIQliXBt6nj4UTn1DbKCZUOdVZLmhAnSjWQei1jcyCb8HRaVCnCBW5DZXElCUblc1XZM4YcqGShCBxfW3idQ0Ig2krX1oFKxZ6Kk50UByYNuYYeMwIbUUBeR2Bs40THZaJKwFFQaqwVslBB4WlKgSBrIWZC02TKiKhLcR6shyWJmDirIVJhdwBB9lxTVi1qAzrl8RWYIbLNWiiotwFpmlKc6BRDoqiFpqWn9STtlXHI6FTMU7FZGkUYMXIMI3GQ0DaKNHxKimgB+Ggpm4CGdInGQiRqMjLopz2IdiWlBVpMU7IhAEqCt2wFSACkgEaEmorLh4hJWoCLkJXmaLKeqmwDarKZiR5MwUCKmEik0ahnlU3lg52NZTkpVzoTs1aGpabpgVoawJaBSHCeoyRZpilqCBnNMALlOgrchZmWSjRWsQQUBkRGx1XNSlGL5ISrOrWOtxyc80GOpq1nmS2JFFmUxx5UIGhrx5VKObRG2B0WOVLZQmorJJGFk12awxoNUGYRqoic83xtCxRSWQWlYUIZiHyOoybF9WFDqBZk2BwJt0VAAEDlI5roCa0SF6bmV0kiKahdim4H2DUZkVrdFrbkASbZ1zWe0FiEZo7QBzgtk0JdZKYHZKJTg1QHmJ2U2J7AqDVAA6pgmJ5VGVks42BOMSocKKprdTpsiFQDIIQVEB2MQjyohbZUopFbV2EnckqP4SXr9klKekyVw5och4gqwzxr45wgd3RdkYmBJEDpwECH9XWCRwDlRDRCcIWZhVDRuS6SdHWPmUbd5lgVsYJUFVGDc2bDaj4MpA4peDwdmqqStLCTcUDq5WSgCHwPUlKUJl0Wk5KatXUZ6AgT4yDCh1KkdEUDdmnMl5EQMlRZmADWFZQrA62pqZXKh3amkDDLZ5KY8lSMZJTsNj5LFjkMEaYC4JnhkqxVwKJYg5ych1XBkCUma63WFWGbBrUhIWGh4YHZGGZhkqjtIVDfERwMCzhPsJ4W2xoLsGXB05CiaT1DtXQMhxlslKTokGTNCHCEoxAnOhGtpEkYRnTYuYRseiqOk6kaOVHm8CjFM0QaUUSt1nKdFGDGBmGsuBnkATgHyaLqynAL5mlalakhJWJVBC6rAW7VZFZnMDGPwkQs9qUcaqnjlSEGhC5Se2rD9IUcRaAk6jlJ2zALmarHlC6RJEnKVzKg4CEhObHl4y3DIHhak1Xn9FziUZ2LshxhVK1AQi4iZlBq0pHSkYWmkAbaOXDIpAkQ4BTlInwOFZWKpVYSwUSYqhREpj3ckxDaKRBA0FrJFAUf6UlnQ4qj2bLPg7IbRgDFQxFKeV2sBxbSMjgieSjmUBxKWYpcOCSGNKCtKTjh2hxdQLXgEoIqdHmCREic6C2cdDLmxYkgGQ3INxgeFSnM1CjtsAEm9FRWEghEygIWgabWdwHUsVILN2nlIqmT1Kzhk6KXumgEFiIS133ZSA2Hh2EnyWBp4Wyj2kmaU3oIQZpbEhVIWVrmEpiKOIElSDaktEThWkFnoiVjsW0L2ZldJx0dAlAhIJrmKCRg86XEli1CkKImprEstUIm016X06yQ8UGOJJTa0l4dwBnMmRYle3zjSVLTJ1bIdSZMpjxRpFKOtn7sYU4pWS4eu5FbFSjF13QrEKxfKkBN9bAFc3WC5klhc2ACYAgPp7QhUH2DGBCn1S3mkiDXlJlewpbUcS4fhQQrx5EMYKEPNYqpWXrXcgraNKKlFxaKVz3oJYBKsYQHanEmsF7oJTwDZ5CPwnmCSk0siFDQok2TAT1UlmKI6RRJGnGAGpIGoo2bZUiI46HOsIHVhVQMKnkoUn1d8jhJVn4eAFjFaq1SUlzQ+k0ekmQihEoYomWnMlBGUlpZ+mCb+aSVxY6YGYAVJiFgtBlRhrLQsraKkoXrlA0bKBhS23qaJILeN40UEWVfeJzPKlCI51TYNGwO9SWpxGmVhmjWAm3Ko4iFh3FNBxST4BgbqgwnRwgD+6REFAWeoIyAJS2luEIAuwJcIXangqbRVGIJAnXkN1aJWWxZw3rSZwBttEqPOEIkdSbM2S4KQzYN9xVXQRIagmDr2abs1ZyBlpgYJSBPCp3kcnqPRHLSdU4HuxbBsiwlUmzQOK7lWAnqZpCteERSZRHMxi7QQjENyk5ZixYCF60LA53jFhHshI7WZlXO6aFA+CGkWCiksomN2TwS4zVoljlURKWLOK2Uc4qV1mwWEEWGB05MMUSGKjSben1IlKBiijLdMgWQQ4RpNnEHWXUIGRKBBxYJMGbJoBVQcW3lSq4RumBBZEqPxpRtIonYFEnDSQVk2X7WGiQVIVGoVApn8oDFN2ySxzVfpVHHAJUCK24gcaAbaUketGBkaaZAKp4JxpqTFiCFZHxXCKrVA2Ba4n0QCzaftQEAN4RLqh1qF3gTZy0ld1HflRIeNqnWkWwOCxLscnFPqhqZwihkmjZKF4ohNzKbIYxrEJXiBnXrUBJhMp5FiA4XazFsCiRSUg4LBZzY5ZRaYBQM4okqpEKjQ0IAIz1toaql8bFR112mtwDdkaqIIX3bx5mKuCBJ1A4CUnpk1h5LMWiFp5zTZo7WIzFqdTWMR33soBnaFRyW6gAFhFaXoTDhxk7XxSGqdw4ECqDMimyEwCGOuK3Jc15sc4xIq0rbSDIZRkEIR4GloiCgglhp9JndtE2sNG4F6Y1m4EmIgVxgloiiAAhj1parWR2mShKTsklrxIIXgWKMNBRiWEmdYCicmrZgqxirmTyMx25mwIIrZj5iuZBruppLyBGMmToDOKkoaB4OJmgEGojMBQxpgk4TlyFBhiBZ4FwsGHbSQVxmZY6diF5XIlLJESgU1HbCN0qdZW4YEm7Cw5rr+QEU8hVdZAwJF2ni9qlBCyZdBrCSambqyhrQmHoIpAZm8pBONngRUV4TWzzo1gVbiD2W0LTY0mBF2X2N8HjroKHbgkVRAowOJCIjegIrJKoA82GrAbSfMBiiEFYlCDqapJKW6HyEFV3p1SxT1GSQRggcq3ma4nHKynHD6qQOwo2G4Egk1a2smFCgWTbJOEpNoGVRg2zsuIlEARqC4B2aN63YBk5QKgVtkmkd21XrgoDVRamBt7HllDTfOCxH1Znkc5FicaxNVk0HQmSVIaLo5nwtsaYqYabVthZbGWLEJAXAKIxjWn4qIZ6J2a7Hk0VEd0WVmTFchFCNZ2oWCVkRsQiJRV4G1WkGOlbkNbRK43yF1EHCcAhBYTQT+5zi02Hn8A3F4kwnIiIHu7HbBGnYYEzoZR6lZ5UHaXlFsElMJCbHUZXVJ7JgwiCrEKWDYhUZYTIdMHlZaKWcAZ3NtmlHeFQlo17MynamCbDUyQISESDOM2QclDUSQw1SiRaew6lNdpEN4xwc5AgNt6EAFFWA5jyksDBEUYAEw4Rnhjmc+XGMiihlk3FaV7TUFKrDVHljpY4oqV2mNy4HarGoVV2UoGJdSJDXlQpkgGDGZ2nrpVjdB20DiKSW2FADwygexFhF84XlGWpnehkaU31gu2Sb0GWCOp7IGkVJZIJKNCxRlYKnNnEHNlTCUaYhEK6Osi1Ts1RgwYaVlgahxnST0aDNE60Y15oocQGMgp1lIE3GKHzRFyiA0YBOCyCq8W1GqH5NIyiKY6AnMkmLg3ZZVpyeirSXMWBa2FIX4gxFMbAoEmyUtJ7K8LRshWJeaH7fGJXLyGgbwQUb+zgjOn1e4T2JQx5E43SrkYIAEJSXBHkohYrYFnaPkkKn5wxMCiRWlXWoVg5ht6oUuUlMKBitE2pLykKbMbHO40BDZmWjOgkDg1oAsoxgI2JoY7Se00JPSRJFEDFnQTWhAF3N9LWPV5aKVCanxEVfO7KtiKUWOJpeihCpOIyeBqgXpyFm4JHNZXlStmGZ2KFCYTCpOKwPtKbsZZYjakmZo4EqUmSgZJTFWGQVVCbQwWbOdIhgAG6iB7EXkkHdoTzAJ47VY60QGCXgdHoatq1WBB3ZMJxjtZqWGV7JF04ouK4iN63ZKH2mkq7thDYnNzSPkjRigj5g22ElWJDBR2kdyTEU1jEcgUwnelgCqYxpNRVou3aVFHGrVjIaeppJ6THhh45SEU4fljXYGAIEFq7Lonkce0aJMqpP5W3coAhLd05fAlioFHWIpF1Llq4fZwIsAwZPyoULOyxY8FzQWQRG1DSW1iwEylXkyLItS27ms7bR44nnw1YKgISlNR1QSBret0HJpwSlgxoYW4hoJTWcIaGtACRYSCXlepXt5lBCkhAY6ERtOi4khUYtUlGBxACPSVnmSC2AgXgBglmVGpAFgqYF9KBgti5asowMBzKZSaZPpRhY2EbK9TSiMniA8qBSc40PqopfRDnlqnJnhT4PuXRaxnptmQwWBjpJ1qTN96SCgDEWWmALZIKm2BmUUxrdY1GphJqoKg7ZwToh1zXT0hyhB2lTclDJMKkZZoEAhymlx2kMwKJhOyLDF6pHK0ALZ4RWM7aDkzBJcapo5RBHoEDqwkUBkXWL1mTrtk0ME0iEh5gWB5FRcVDXyZYoowgRuIaRqZYJkoCXkDWF9lmaFWrp1ZQWCIoCG53TE5jXaCQEgXWPhDDP1SWVNyBXOgZh8lxfI4LUc1BaY35GOxKgOUlj0jVNJCzCymKP5ZXts0ZJV4AUki2eQG2DYUIVK55Ap1lQwFSfAZietI7FBTghmQwaC7DaQG0KRH2eYx7qQyIS8QhL90jjpQIfqUTc1BBHyU6n0FQMIxDF5lBdiRUlyTGEoDXsMgkt4TWE4YQHKYgjSioEQY6dCGpVBbSlEWXhBk2BdByIlpHh9CwFOAUsKxGox6HsEnapuVmeejWYMhFj2pmDKlWZN6ZJyrWSml3OyCKOCJmZIX3rla5eR4aZAASa+o0t4LWHZbCKNyleE7DoB4QtujpqJQrWly4rBBpcAGkokKpP1xgWSi3GcKToQV2L4ESfNKFLJ2Rh8A2B6oDosRzrahGNVlimpbJI5lwEsElRISYqBjUOBxpjOTzIBYmH5WQrUYJtmSnHp5zWlYZokZLM+TmQMiolBxAjkAgFtBkWYnmWtw0VpVGLY4kTGHzgRopqKX2OoVCRMGwjNLKT2jaaOqWpoqmLNkQDk3yRynpsMlodRGwbsyFK55TNhbTOMbIrSBFPC2QNlGIS2GJDwymq1ByoCLKhxWbkV1hLqYLdmDHAJThluBANFxwKd7QdVmEKtCoNUGgN42hsKoBlgEYRNiCGsV3Lsj6HQLDNxBqESmYMSkXSSaAm101fWK5Blj0iNW0cebaIVX6XNm4txa7S54WsxBwQZkRKQDgbRGHnKRzkRpBhyCCfpZ1dtqzDhGUCWIHDCEHjRIithFaPV7IGiQiCSajLIgxVFTFPqmgpQ2GJAz0scS2SNzSPSIkdC2DrF7AA1mUEqJ0DEZ3G1IWaxzHqYKVmcVQgq30XejRcopQm6UWHyXHjKhgW2GmXan2Q0l4EZWEcWJhokF5CZl4UNR5g8IRoKkbdZa1WmrEAB5wH4DjEkglNkaKSuBWT1jVGtC3LqlwlSlTotSVEVlVBWjjiST0JW2yBN2zDZp6BE3mqNUKNIwnbs43GGF0BRaIsFRTcUohJizVEq1RlQRnrwAbrVJZqi2FpN1QMRKwS0xlkFVXLEy1U4j3CxHmqeAJK006dgabNOaZME7WcRqppEyLlqgQAcT2YsEGeiYVG0w5lu0ishTVGOpoUIHJZYIJKwGgbcpJGVxjK0J7JGE6cUX0DWyml9bRPpyVcV3ojgJYAEnBi8UjV2KqB6lRUGjwHZDrrQbJOuS0ExhBVdibRNB6EhyqZBIYaUlrHNUpcCTgCqnqEo5gT1KEbN3nfgFJgV4wXcVAl4pDPtoRlV10Wu5Ihhm6pJBamoiCUlxjUIRId00FFN4aB84SOFgLBRAlKtl4NZKiHxCDMeT1nqK6YqXaGYVKs2hDMtREY+KnnEFzhEGABWqGTaIUIRkkqiKaatZqdwYggiQQmeYRlUWHgQJ6rxgXX4bSXChrHtKnOUGFpsHmZ1YSRuhim+F0hwDqlcmLpIYkc0EXtIxHSKTyRV4yE6GhGiD0FCIqmlRFFMAXgw4XXyrZW0KCcEgmkYJzNEaybebDZhFbAZbSBNVQWBVbF6LQPQyzkFXDOp5lliXWeuGVrSVUcQAIekymYWRFkibbkaj2Fhy0IWCFQuGTJZ0ZVpWrroIItOUZJsgULAlKbAw2hgiqTcgnjSBmhajzR1gWJN1xEchpVsgGQVonepwHRxUYZAhQYibDJBxHMlzQjFwBpaxHRJGLLWamAsUiccHjJgGGq2IFdWm4VVLEbiFiQKVTskQolMbZFWkoNwgKJikLXCX3epCoHBayi8yXECJ3WBBSpkpFEe42qAKTkgRTBiorQyCnhUHZBs6mlBDSNtYFIJjlYFlUdNkIAFrVZZlUMcQKKIloEER7PgSBPtllYUQyDtm5T2S1f+CjUtSFIAgpZCpaaUHJCAH6O562OiDDqYp0aBVqRGXVMkKlYUJBTMoQcMQ1tCjAOGrLrRZXjeahiYySimK3BhREJR2GGBG5Lpz3MGD6kCFVdUIqJQVAPEZlkqDYdAjptICzIOowT8IklEQZAcEiD2IlS12gXV2DmVZbJYjwZtBjZMB5I5DFAGBwkGKCOwLLJSpjFAh3PETgLMzmNhEXUBU7eRVEDIxVhw22YIBmGVUBRa2Jpi3FT8B1iKgqrY06QkmRROLWsxk3HagAVGj5TRjGdlihhs1WoARzLknBIRQBLukLpGEFMFh5nY6UHBxpFQYXsmVjqxmAjUY7c1AkBkLHlgDzTZQrmIoLTdJFfEhAXe2GRxYRXpIABdJwTAgYtOVzhkSAdxFaPYrLME7AbeoochoBVgLLCokIQKYTdygIgKZ0sp6hZyUIES3aINV4hokipeaGHeo2WZ1EAhXnTxyrKkqhXBaTF5kQURxQCmzybSXlmckgQoF1ZsYQlS0mn154ctRge4RzLgyQqIXxKma4WdRjT93GZdGHhMqwp9kUh+VgTKobVpQUQmF1Vg1DkMG4Js5WrBC0TWolH2yoUx2mldIznEJQhMUJSN0mQyD7WBwkKY3WkgxTQxWLrN1zcWiZcQSKoFopitBoVV1nG02VQ1JrV2qxeihSOWVkkGirnGZIlsaKFBQQjBzRdtaQPkECBJgzlBSAmdAqJJSEgqAoGeGopKxXqGSjrih4ZahJFqkEdFxYEUh6WQlRYAq3Ht7KoxjICyDAKkI0ZcxzjFDlqGHKGmW6TOmlmsgmWqCSUiVIERH4jVSoseojhmHKOeRoZoRmBGCSa8TBrxxwjWGyal2JSlkkbZERbZJ4MZB7t9DFURG3KtK1IhnpYgUymZSHtA5iBJFXn5k0GOz1Weh4BuyVX05nFA2gNCkzI5gDt0IiCaBTPVHSCcX3dWkGbCozd+mXqcppgBApRMUxN9XgfoZHd4V2LmCSlyJGnN54gFgknMAUWx4GhCkxmFFZBdX5IGSQDA6Xrqm4n0B5OQGJQ2wkmExpmoE7kxDqB02QTN3gTBxHIOklR9YgEGw6XKpSgEy0ewQToBYKI5FVYIwoBSIyAIElnkzLjgKafykwbOKZUx2lXQEzNiCgf9InmEBHGoZzY44gDY1kdpw4TliIkppHjWFGfQabk0JGmNX0axo5LW3reugYKdYwcpYxIRHSqohSClIAfRRnMqWWGEi7QKqwiqVrk5AURVlyMaFLG2aBdkxLHuTQZeUEfhoGVSAQd4HwjMqgqow5Gw7XQ0H7PqQjbWj2ZUyxpsYQJxSkqISgByELNEGGZIVLPRYKEcpVQi10FK46Q2JldxKjnSJEf2HLIR1gT5wig8UHSuZzdWCpWolkp8JDfojwnIn2gOiwlOHBGeE6nuqoJOhBLZSbO6SzIupBb1K0PUTZHESoV8hwUWqWGh6jR5ZzgkErC44hUEFKTM1LDYQyIA4riQUUS8BUD8FmFRkKT1GjWJgKQOjIRA6Xn6RBBqViqZ56JSWTNNhCVQUBbZZiRcy2siWKm0rKBGoHN2HXSmC0KM3hkAXjlI45hcYkiCoaZ52lMFkZMWCyD2XFC9wAAZyqoiKJKcl0dMBZV2SDWxGyfAEIkMWICh14RkEZZxVUCe3bqhVSHImoWdVbIAGSh2qqjB5CrtnyeCJjqODbjgy5M0XJdY6wcNg2ig4BDZz1UaxkpVnFFigKd4QnB+ZiMWnwaBVWccaIK+VGKWiwmESGidzzGQkYhKJAjApDN5zkMSBXAAUTigQqSU3QBORjbwJAApbCOFYXBRGJBoZ0t5nRSGQSiZJhsaRDsGiyGOqicwGrmuJYtpiyUyImMQYWkN6ZQWEwQA1gAd3QbwGAYs25Bih1mmqpOxHTiNDgCJgQSOwAZExUIs7VfJRVgBYypQqDH8khj9JDgKo0ft3walC2rWg4Wc6TR2SZUJ3liWrWNF5RW5ikbqEyHUXzFGSCaGn6WilloeETe0IKQFB5klEidkzyhNwSUtBUONYwghUxV0nEkWCKqSBnJGWjfgwkWJZ4ChkxXQALJSRBBwmLVRB7BQXBQpEVgEk5jgT2emmidtSoN4j0ClhqiaJGfFF5NKxCqKqSYsTnopXIj0wrbhhpiSjZUAh4McngEkHVJ+TjCySFYwzAQwICKwj4Lcg7EmQ5PoQhBcJlaV3ZQ0TQgJjTfU3Cm8BmnOLDQ43jn2ZJn6m1K5mRHEWXfKm3dOQXc1KrldH0BMqIstDQA0Q4AdJIVl2IJe4DY8TkQ6TSEekCTyVBhiQlrgVZccnzmIYwbhUlMwYilgY2WCZhiWLRFOSFdtGhf+iSDMjCkEJocSVHiZgwDWpTIAWYn0xwGeZrS51zDaZCUMH6teIRYE4UqA1lMEkVQVoZsu3HMWS5TcWyWwazUpZXrRSqDqjEU6BGHSqRpR0CbVXiSqFkZ+GmewzIQKIaeaDUBAAAAAA==";
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
