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

// iconpkg/iconamoon/src-index.ts
var lookup = "AAAJXYkZBvUZAWUay5A1nFizFmhkVDZGkiRnp0dFNUMWF0KaZkg2UlxkJoREOFlBdFN4lmlVM2RGdGY0dFc3OaVUlFUjZXYSc1Q4dnV0VEYWRFViM2ZBemZURWVmN3OFdiNUNEVzFYVEl0UyRmZVRjMkgzhVR2ZxQWQ4KHZ0NDYjdFNHV5QmQ2U0N0d3E2M2mHQnOEgmJGJUaWJld2RXRlRaN1MjNFNGVTpjc4UmR0NyNms7sEU2UkRDhoVIFEUVJCJztgRZAXBKzwGgAQf0AQEFNgYmBfgVEH4qaZciqwEGQAMEDwNHAQLOB9kEIRC4BwyUAQWtygETChEHA7UCAwOnBgXmARQQCPABBNcE8wIh5Ab0De4BBwsSGSQDEqEBBCMIAxEyMzfxAdMDAzDgAQgLqBMuFwItIQG0AQMECAWTAwgQIkJOBXgWPoUBBAEDDgI7AjNIOcwIHywOCDEyBAMEJT8BEjpzBiEBFSwICA8TGwYo/gMKCU/JCgULFWQKMdIDB3oDBAQKEQ2oBggJElNCAjEJCSqDAQEsWs8BCIcBBAFtBwELeRnMAQoLCAvqGWgEEQNZMAMyBn0ahAEQBQUdHAPKBNcMAdUBfgGcAg6TBQxMAQ8BCjgumAiUAQ4NBqcCFRQfkAEDBAoCAf48BCkEBysKBgYSGAcMDpsDAQcaBKwBFJwFiAHfARQWvAEZnCQQszsC7BMIAgwFDhEDAgNEhgo9D+MDBhJ5EgEBAQIBB6IBe6BOFwJZBvWRITlHVKRLxT2A3pztlG/XiVSY0RFbWXDLMUt7p+hjsjgSVxWeIHuUmG0K33weytr5fwxRCpuv2nENH9SL1w8E2nTIeaZAAfHSRnEvAaFcsLHUqO452+o0LVt57M2B3/jvAptPgnUU2j9Ko+EKWm+fW5XbU87lRBXDwVG1uJyB9/KvdmRUBPvbtIMW681B9mfpVjGuHjVpTk7cGaSKBOPlrGuGAHRB3TGxQrf4h+bsK+nawykbDRlZVfO2c84bcn9w8bMmdEXM09QntrkjUdKmav7qx+PlKhpdik1S/M/Lqo8480u1ZuC7J5QWUsD+ouidGO615AFK5bO/HVqeJy+1SN5E/XnLXCHuw0wmw/9NZ0e6daWSKcSHCYBLHv6dpC2tDH3EgmXYxIkm3VO/U4+6sp593WsI+XzEBsQKe7LKlHr2wHHebB24XX1H5UBvW2rlq/KUqVcMxtyCtmPrkbB4IYVqTKUbwohcEd2cap0aA6zvJGv/n5Na5MuEMDbiLo2JXU0m6bI+nqu7GxRrRz/mZUzZvVORPb9DKbv+au6QaiV2qf+O0gh75+25jXL2dwNxVRme//uPrupyo41YiVatvIAewn+4WafXEGnmS7GzC9l9YUN15ldwExQU7gduvpdwGIvMKyI9D6eMokTJyFSp6JDWjCMwlgvkmpZ6pZ5s9HZQhhIzCNxwR34QWlS7SmCb+KCYWFpQpdxuJwxciXW71xwpRoMczFZGXlSvEVnkYbH/kkGhGYV3TbM4AopZ+gg5bHZdFdkB565VovZngCPs5fq9uANmbm4jm8jbpHWLGs/QboXSlhDKujlQF+wvZeEnGHXdSXHj2GiugIA6WW3M4wu81y+aaJ1EntSHxCLHZuPkZ9PRqVO8K86VjDEi4f6I7h14D8jB6lXqoV2Tz98FhQOzR9QDHF4wMBku/vaanYSTXWTTzuIkkU8hOEJAcwb7pwl4lf+k1bBM5ZNqMClJLcYFeAN8w7o/xTGb9TZ9r9dy1Pi84xGtNo8sNYoSuUiYNU32RKe3qiBphy/pNggJsoEWevpYgHceKARM8ileI9DbAEvmYaLIPN1uSCXVaae1GFMb2b7EKt5+JFP2qfx9DuGAWk9s2LMWhMVJ6cF1zUR1W7mYPY1z/0RajaUYLSCvLhiEJV3aEf3k62RYq6W82QqOjkcHMN9pzpm6d+ZXtO/itxyvLKYlD3OvOjaTbVTyM+7o147Tj21M1Su7svY/S6KSzxo66QYWeyxQ87Ha175sboduoZrFJE15Lmyc1tJZYOWLas/Z7loqfsBHN3umEz0MzPb+ZcVEOfFAGENkyBYlIOzsP5JNHD9R/BZEm0Q93lgyWyGfkINkBCzRvWpmSzXnSZSya0Z/NQ5QizJ61MUYbmryp833bJs5M9uu1do9ep/n1qUrjMUHM7jQcunVLb4FYP2fPIut1i9eDgKnV+SGhYKgI/LkFcTIlNOM/oR3W7b5qg1g0+Tqc18oJMybuXtg1HtpytiGkcukKo6hkRzXYZBkNHsKbWJRdcnaJPQzpx22gTm3AgI3kIIQjisTMydWTQNV973pCgfsctJaFsG/j2U7iN/gB6I0YzIAvVY4f6IXuYwJQQExpazbG/z/z6YxV/BnPOEaFh4mffluvl4sJyqBwxAhAfdcVgY+FmVfuJJobDudDaobNgGqkHBEt3SU+bf+o3n2Y588Nt/8iZte1KfRt4MlPlM+ESClbB8bEt2HqsB2QhaVsQnFYTCACkNkOJwm/Eu/dCZ5nFYL3ab0hEvNAZmAbaoCYXJD49bD3KjpE/t8wSvhNbf/3ElMlezyB6klmtlGW4IE2koiqctpM7q00pBAkbp/RMn/2Q19nGSHRxICdXlpMjzQQxu1a8s3wHdWDBF1aLVRRfQx8yo4sPNmMfl6MLG/2jx7JwVtdMkm1plT6elTFe7Nmi7zGN6wTGrO4M+rEFBpbWgydkSFOpT354/phIwtAij36pJOrvH1FiJSYt3dfhNTB3JcKgxuwgs6/wB/RvXyFdHp3LWpYnDesXJUZEGzWFdDnf6yId+GxVkpv099JoWNtmkFiypRZ+HTHy+1JP9n0HGk5pffQEaClV2SGhA74+1mRGjwJg+f6IfsGWrT8TnHF0xTuQJPkwU+MSl/ACGW3gl1C+cFp94BxMlMnIavA/uRqILgwpWDeSt7bP9Inj6nisOuGefQHYK1At/36zbT6ozjpXibvfTseFhKaQ8HwR6X4pVJgC8m7cBJC1KyUNZn50OqZgTDQY8nJw/dR2CdKLMJ1KSY5/8TSXGv6A26q7OzzbuU45DhQc2XwiVwZNQm/SmRqwNMf55LGmwXK/zDzROL45UN6dUOqZYDGVFddd3ZkBh2kPo9C1gtApAAsgAGAoSAAgCCIAwAKCQBoIBAAgSAADYIEAECgAAABAEAIAGAlBAEgAgAAAAAAAkAAAAQaWNvbmFtb29uLTAxLnN2ZwAAABBpY29uYW1vb24tMDIuc3ZnAAAAEGljb25hbW9vbi0wMy5zdmcAAAAQaWNvbmFtb29uLTA0LnN2ZwAAABBpY29uYW1vb24tMDUuc3ZnAAAAEGljb25hbW9vbi0wNi5zdmcAAAAQaWNvbmFtb29uLTA3LnN2ZwAAABBpY29uYW1vb24tMDguc3ZnAAAAEGljb25hbW9vbi0wOS5zdmf/////AAAABAAAA3sRZghRF2NoBRQwJoMYh1MjBSBBgUUCVIFiNXU1ABEgETUVgBQiaIACNSZyIIgzBoYCACdUR4J0VYASAnhkiIgmQhYWQAIwREYTAXIlR0ADAGdkM4MignUXGIIEAkaCJTZDRlZwdhUSKIUjSCdmMWBSRAIDIhY2cgIGZjFjRHOCGHICJCF1ACg1EwQ4UzgYIQJVdDUSdxMRSFMGJ3N4SHZAYVYwcDU3FmBjRIOHFFFgR3EHV3JBZIFxOAJXUghigVUBMTd0V0NiciVIMHBQZyNoQzADNzdiRFYENAUVgGBhJSR2ATYnNWNkAFEoBHMldFcQVSEDg3IzUCATR3MhB2MCdzBjJygoJhV2JXVCAAeEIkUjBxcXclcVZyZldQgTR4WBRBEXJwhoRVgEBjZkU2F4ASRUaFBwAyE0RUYEIGEUcHQkFoIBJxVxMXhkRBhyWHFGJ3AEOFZmU2ZSeEGHMgJkZ4JSNFcHKCgwAWNoKEYoB0FzMlcUN3VTFxJIcyVgglcnEUMWZRJ0YDhYh4Y1gFNgRHcmNRAnURdWgzVxRoNnZIRxFRgTMUZoU3MAQFE3IWBxUUV3YyWGBRRXRxAFQxSIdoAEI3ByFxM3aCghRniCAoYoM4EEZEIxQTKCIwWIZRcVNgOBUocVdUEXEWaFJkJTNGVEGAZWNHEgBmEDhHNWhYWGZmRGOEBRNYQjAyKHd0BIAjeBh3YIFCYickVEQIVgc0cUhzcFAhY3h3YBcQc1RmBlRlVWGFBUWGJGAwU1YjNhgVhCYAVzUgRjAQSDGEMhZ4ODU3VDaDIGJTAGJHFoYGQQgiUEQ2BTIGNEgxg2QDJkACaBc1QyRVBGQRFSMhgXQBYYaCFUMFUjR4FScUQiVEMQZCYBN1QUdyJVNCY4ghhGYjMnZhRmeBBThVNGdydIiIUFB0SIcHaFUQWFFnNTZkcFBjAgV2UGSCEGRVZlJjhVBSJ1BFUnZRQTJDQHQBCDKFNIg4R3dFOAIVFUU2gGIjEyQmFQgWVARwQCA1cSFFcFcEcCFRdiQAMHQ1NYZGdxAUcThhM1QYIgM3IDcRV3NQWAQiQ1aHF4UkciIRI0IwNYFEcWOFQmEEJGFzEYBSV3AQcXVocxIFg2g2dlgUIoFVNxQydVMWGBRjAYBRIxRjMXFGUIg4CGY4J2QIdmMWdkYlAjgXZgQwJYcQQAAAAA";
var chunks = {
  "iconamoon-01.svg": new URL("./iconamoon-01.svg", import.meta.url).href,
  "iconamoon-02.svg": new URL("./iconamoon-02.svg", import.meta.url).href,
  "iconamoon-03.svg": new URL("./iconamoon-03.svg", import.meta.url).href,
  "iconamoon-04.svg": new URL("./iconamoon-04.svg", import.meta.url).href,
  "iconamoon-05.svg": new URL("./iconamoon-05.svg", import.meta.url).href,
  "iconamoon-06.svg": new URL("./iconamoon-06.svg", import.meta.url).href,
  "iconamoon-07.svg": new URL("./iconamoon-07.svg", import.meta.url).href,
  "iconamoon-08.svg": new URL("./iconamoon-08.svg", import.meta.url).href,
  "iconamoon-09.svg": new URL("./iconamoon-09.svg", import.meta.url).href
};
register("iconamoon", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
