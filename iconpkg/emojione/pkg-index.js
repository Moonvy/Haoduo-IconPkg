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

// iconpkg/emojione/src-index.ts
var lookup = "AAAJoYkZByoZAW8agrVnC1i4hFhzg0Y5NGVSYmdkRDNYhygkNFZVUkQ0hFMyUzWCplh4RkRlVIJkhye7g4o2NzJDZIJWdZJ1hVQyFnYkdlY4YwIlZoJkGIWyE3NYk2iDdzc1eFZGJFdFmyVmVVREZHRFlSRUiHNHNXRVRkMkdlODNJVDNzVXVzpZQzFiJ2WMNoVKFqZUOkUlZXJCVmgxdGWKVmdFVCR2ZzcWc1REZTYTQjCDZHMWQrZXNhIiMjKGRYFTYmNRhlZVA1kBeQSjAYQXLgJSPTEBnAUDGAEBAQcIXEUNAxoGBQMBywK1BYEEiwICCgNkKBgEJAkgAgmhCAE0BgESAQMBTEHsBk04pAEBEgsNAmGaAQIJ1gIHM5kBZFTyDMRX6QOiGgINAmcBAQIDB1ksBz1HqgEC6QwM3gEiGQYVASchUQMWLwIJ8gcCDRMBGkkBSTbNAx4v/SoFA/8BhQYPBP8VxAYHAv4CLwXoAQktB4sBFBANKA0DAV4MEAjTONcYMG8fNBAJEAQLDTUDBUOlFQwPb0wHjgEDBAHWAyMXCggFEQNaHwMNlQIGFtABAakBAwwBhQEIChSaCQhJKQoaCBKCAgI5NaZ52gJFBDfnARkDLz3mFgEb2AwBAwYOASIdAbMDAQsnCawDdgcFYxwPQesHKSApFj4HLQVk+wFpB5EBCXRbBRMVAimIAioCBAIDBAG3AQYchQQsAga4AcVezQEPgQEBAgMIAQMUqA0KA94BBQwaDYABCgfsAzICEzIIAlkHKnkTAAV+agyVKjhgnlDfveTV5ExatF0O0jgiI2hYBqiHpONWBCRje2SRY7CnMVtcWCO4SYmMwM1YyxKRvWszvoJFeV8zQje+XmgM/ECTl8zmiignG5jjZIK1VVwDP7uBWyyhvIsmvFFqfTO/sQJ186xbC4fUNVo8zfSpfjz8GD3AS60HpRY9z3coYwdebMkcMi6Q2Bo/lNvYOVUFaAESmK2u60c9oeTZxyHHGkBkD1gzOQn1FsWwTVNdfqfBLhno2Xs/sLrWOz6YZfjGp3yFmqz4MQIa1+S+rkfHtR920TCP0KClMUgTYiuYAZfHwrWv94CQaZl2p29swCgt5WUWrje+OvxAFFnRPb2PJKGNh2+qsmATfpP9Lo0hWKVqdRnuoMAK4/EHVE8Kc/ElW2HXMdbpxs+pfTCYazsqhew5Uyuty96srOKx7PirDvrbI9Qu5wnix+30GnQlmpJ5hvxgx3wSsjfYxtKnT4OzpvpmOha4HdvqbUiqNsmLCv+Y3YaTCGwNNIU/CgQVzgsFjXMmQguamtYOCLRzWTZCOaZEClvS78/DpQHiKrfyJdlZdfDcc81gRWT5dYdz1OetAZB2beULqcqcce7yaDCFT933W45eNEEikJQXPqmg7LHe6k4GITejsjrcEdCp1GfcnPH3FCD3ob1susDzxESWjXtaIRwt0DiXEVofO0mk3h7UKipwlycVDiOXRKdBqWi8s33r1QfRAb+/iflJF7XR2Q3sRYh/8EMvUEhqIXUYlKfjZMWxsUdeostvArOTgR+XGdiPWsFvLR56CAeuPz0MTNozEISrU6UhNa8mY5xnzLwRBsMVanD8XjB77LtOYWeb57oTBDNOBSvUrfHKtbI3v29ms/f0rWTeOHKzveDFGJUC0dWDb9/lOqwDuheB9MM3o0/2oug/rFLBNAHVB10116U4x3/0dt5lCy/XNvrXAMHRmhzXaqDHrkkkSzsY8olNCjYaFa5yi+1+P/U22pWMY6Hu68cQuTlAmdvpwDuvEmmIHq26ZFuwqpHTQv0OhxgxUi2p/xLj/X23HnVVdqCO7VT6PMz++u2B/2vWW8AUYeVIdtIquMJO04ksd/nHCGUjB7/9TWGUu4S93NMPSrE4a8H0Wh0AfF2rqV3xTNUDLgfYR5y5ZGCE26XTZxUnhJQD7eUEPgIA7W/eQcrHwGqpWR0yai5BMtTuGhLi08tkYGTbAr4XSALXM8XAFvMTIOOD41Xlw0z5QnliMySmbGx+B+Jg7SJajrTtbx/bGx/9bdAVzO8lu4VigQaRLoSvK01aUuW/MsMd+u4fJoWtEMvbha++E08alhBHZYmUBrEduBzQWYoL11LwGOy3GfVUis0cfFcuO5a5h6lniaKl4phcuT1hd3p0zXHRuce+qHH4W498Zkm/iM0qG5ZnhlrgRvSFAKNGNPNyae0SwlkXekngegaOCCuHAkPJySf4h2CGRnu0cFOVQgA/WUaPd/KtqqF04Ve2d2kdjBsTl0N/9H/CrHwxkIIkDH4AZBIN6CWsw3LuvrfUMx4DVuDG2RJbZYaan1ZVTJiR2zKpdv+oxhGObMY3NxuZQVzwAy9UFvpL/Xdxou7sVgNxtodLaygn23a3dABPPUNrdD8pQPXWU1zfW2Y/KTf9Ax4zANWnx8dKb1Y/9DlW9GwPWcaSjxEaAW8fa6eVWhhhKUECsKf7Wy6GefJkF73x1Lp7GLLf3iJySLmre4t1UYI+qLHL9P4fy7mzFwFzND3vbxFnffLj7wJgNnlBWJFpMIchSJBqIAlKn8+1ACWVL5PU1p6vrBQBWOFNDLrBV28dNibd8x8RS+0t1lhm0uP2qwLF39Gw5r5zRgkAVTOPQcNReaTZvi2GdF+RbUHi8u/rCibicAJ2gxJQyojugAbrWBL+hnI7NzdcxdrI5AS9ndYLxKit865eykpGb1CtDVyYQIQxbiL9B6D7MNZ8NL1wamGaXMJP+XfVxwqwOrFXV+RCrqa/dATn2vp3tZVjkDiD114qOFv+baa+IleBoPE76rNjFblC3bsyT0ZmJjdjdNECBIPDsIFQC08OLC3kdI/kIvASR/Z23ysii7rvQ6T/BsYVuPYMZ7OO7i8K2Y+WCCBfKH+x4H90/9+dxOFB2/P/lxdKyqJkGdQuz9ZvLdZ5q6J+tIzb4Gu/LvNi67pS6ZUCldpmscdMCwLXhp7qJBxs2oimF3xwe36e7oGicP8So9gTYHYDLHu75z2Gn0t4L6Af/cIDW9usJqmB26VlMzxigrFeGLaL1x60RQPgtmFKvyWwS13sri10tpKrtEMO2z5tGJTzXa5w4g7vghVSlO9/JT5ppXGXx3zYhYzKWv+Uu463WTrlEb942Iz6WW5PnZbrG1LSAIPbwNgdqXPFcZpJcOWkgKdxBGvY1HJsEfkCSstTMCPdV0vOxmQndaneU7MG0x6BYV4jBS5YLkCAACAKBRAAAAQSIAQAiSADSQIAAABCEAwhEJAEABQACAAAASACBiBBAjhARAAAAAAACgAAAA9lbW9qaW9uZS0wMS5zdmcAAAAPZW1vamlvbmUtMDIuc3ZnAAAAD2Vtb2ppb25lLTAzLnN2ZwAAAA9lbW9qaW9uZS0wNC5zdmcAAAAPZW1vamlvbmUtMDUuc3ZnAAAAD2Vtb2ppb25lLTA2LnN2ZwAAAA9lbW9qaW9uZS0wNy5zdmcAAAAPZW1vamlvbmUtMDguc3ZnAAAAD2Vtb2ppb25lLTA5LnN2ZwAAAA9lbW9qaW9uZS0xMC5zdmf/////AAAABAAAA5WJNjFCUTVSECY1BiNGhGBUJYMiNDQmMlZwYCE2EDRzh2QEQ1QjFWdxVTgyRTVzCAGWJkdSaCRzFFAlSBMjFYWDIINhNldnBwFyFYIEVmdRNXWDiBWRQgFDUUk4QIFUcII2gVVRJHaGAnRxgTdIhnYkQ5GAFGdYKIFoUCdTJDcAgjUBFCBkVSUzIBgzBXNhE1FHgmhhglOJOBcVFxdiJxFVYoc2M3gGZSVTgZI4iUcTAUEjRIg0IBUiYAEkAEYFAQdZJoEzBBhSZiZjYFKHAYggBkQGFUByV3aIdDOAckI0UmZXhFc2CAcFYREGY2g2YFRzBQOGKGEkUEJQiIAgYxaDg2dGYzKBiHiASBEBYxQXdBEFYzY4IBiGAzUDdic1hUVkU0gFVzcCSFgXcDU3g0IkJHIVU3Y0ZZMScGFmdzNDeDWAcxVHgAaIYCdyQUJQEHOHMGdIQARUCUEkJoUhIWQyFnJTRBVFYYgzZFh4gShIYWYBBjQTdHdSI1MnYQFYZnJWJGJTcYdVVQhHRWE4NzZXhShFaEQBMwJ5BEaQZYJ3WYg4MYcQEDB4hzI1VDaRFjUoZ2gYJYBnczMihGRwNJIHMGKFFIQ0dkEydhEyFVhlggUDECdFGDEwclQlVwgnZFcHFEhoBnFRRVeFgxdAI0BTZyVUN2Bxlwh3IhcJRHQmJohXIiIoiDMTEkFYiRIIFxMEAgVYMzRhZwEhOGdlBTQmcJBkFDQyBjgFViZxIoI3NBcxSHYXJERxVEiHcSV3FzR3gwYRF0UnFUJEJjJUh3EDVAFXAFACAXdmAFYkFXSEGDcxBYSIAIYohhVgJmQRdkBTQZUBMid4hgUwFGQjQIRYdHYieDSCREGIc3ECZRFyJ2A1JwQUBoZYAVYmFkGAZAFTM1RQFjQDIGmBAyNkQjB2YCJRYRIiYFdAFYAiM1YSMThFUzZAcCdGVhElEDIyRxCAhHI0QGkUeXEIRAEQMhYHARU4eCZREQcAc0AANYJTUUCUYIJSRVcAhBhXeIV2dyYmh3dFMkGGYohpB1WAJyKCMGcDhiN2VzZSlVeCCFJmY3ZXdXMVB1ICcSWTgXITYjaGRBhYERQgYmZohReBFwZmNygGd5gmNWgTcEYokWWAeJNTVkgnQxZkRCCWUDFyNHQlBiADA2ZVAVBDdHZ4FCRiBDWUhheEJFRxQgdCgxRFF4ZBFAACAxAIQnmCFQQHYThSVAAlUgAAAAA=";
var chunks = {
  "emojione-01.svg": new URL("./emojione-01.svg", import.meta.url).href,
  "emojione-02.svg": new URL("./emojione-02.svg", import.meta.url).href,
  "emojione-03.svg": new URL("./emojione-03.svg", import.meta.url).href,
  "emojione-04.svg": new URL("./emojione-04.svg", import.meta.url).href,
  "emojione-05.svg": new URL("./emojione-05.svg", import.meta.url).href,
  "emojione-06.svg": new URL("./emojione-06.svg", import.meta.url).href,
  "emojione-07.svg": new URL("./emojione-07.svg", import.meta.url).href,
  "emojione-08.svg": new URL("./emojione-08.svg", import.meta.url).href,
  "emojione-09.svg": new URL("./emojione-09.svg", import.meta.url).href,
  "emojione-10.svg": new URL("./emojione-10.svg", import.meta.url).href
};
register("emojione", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
