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

// iconpkg/noto/src-index.ts
var lookup = "AAAT5YkZDtgZAvgahCRqXVkBfFpDEoNCQllFSKKyRkFEZDZUVlZUUEU0NSZFhFOaZDWIZlZnJlUSdCEYVoM0dFSVY0gkVzVXeHNjWEhFM2ZxOjVlOVg1lVNVQ3NjJnKHZlNSJVR3FGdBdkd4M4WVWDJGaLQ1ckREYmVGOEpyliVFRENmRFckgjZ0VEdGdFYlMkdkkmhUU0g3g0UrZyVSVYRmgkJZZza0RWckZGFUNlJFR1RURZM2YIVEdpaCVjFFc1VkRkVpU2NFVjUmhURXZEhUZzQ1sUZ3JVc4Y3MlOWhWN1Y1lzdnVVVjRkBTU1VbRVtWOXRkdndTJJZoFFQlYypWVHQUWDqWVVVmMmRUc1JmNlRUFEEyQ1NTJFRFpzM0hWo3UkZDiXdGg1uUWaZDlDMjVWQpgnMycTQyNCpYZGaGRIVUNnNTJ1VSNRdlR0VjGTRVI2JlV0dBN8RmdFYig4gTdkREg2tnSDVTl0RVpEdzVlZFWUcmPELGcVRaUkJLZ1JFElU1hZJzJUVGdkNFWQMZnDEaBgIDzAc3AS+7HR4uCpICBI0M3gMyDQ0LDgIcOgMEAqEBIQEVIkMCPQTqAQMRBAJqAeQRpQKHAVoC6QExBwllLjQDJgQQAgkxigUNVQKyAwYD7gQSBSX7BAZTRgQEASJlCwGYBCh3EQWIAgIDUSkTAQsRArUBFJwC2zcDBQUFXY4aDcUFEwYLjggDJwcDAw0DOAR3O5gC8QGOAUZZBwMDBwQeTwqaAhUBP0stHN4CiAEGJ5AOOVHIBgKnAQrKAh8B1WlYDgKqAhAHCQ0GdBETJgXYAwH2CAkBpQMD/AECARsKBgUCGTxSBRtSBQGQBU0BDz4CC5MCA0oBBw0MDQEBBfsBCAMKlgPMBRUNAj5LBDAB0ANkF85cAnkFGQMlBgQRLGJ90AEKUQPXARdAFgG+jgEKD9oBLAIFNdABBA/0AQY5AhW8AQEBAwY1AQIInAERVQ1JBj0/Ap8GBJoH8QI6EBM+CT0oQykEIgv3BzcCFnMFFTITFAOgAQFL6RAFBKwCBApXTQgjEB0pAwUjAocMBgkqESonEuIFAwEbB1kNA3ALKUAVKAUmDQkQrQifAQMPLUEULxQDwQExEgMCBwMVcTnbGoYBQQbAYRNaNBcCBRcPV+EBd/kCBhMGAhajA7kBRQoGQwkCfawDhwEZDAgdrwEOvgEUtQgJC4oCEwUUDgxeAwcJARED7AEEGTkrAQ0kDBAUIwIMAQEBNwgKAw4nHIYDtCASBwMEoAbdCw6gAQEDCAkBBgWAAyCMA50CAgcBrQavSRYF3wOxIQIV4lMGAcIFAwgFDj5PuAwB6wECSAGIBx8BAqo8BH8RBEkPAYABngEKCQPGBQcLQQEKBUwdAjtRAjIBuwEGAQMHCAEGtQgcAgFGAe8BCgSZASWEAQhwEPp2JBIC9AE2BgMBigMpIgRD8gEcDwMGBb0BxREizwMWyAIXDgUGBlOGBwwETH0K6wOGAgoDrQIXBb8BFBIngQI16QEGLwTw3gENC0DrfeMBAgy9BQcMBrd7DtgBXjY/HjQcCiOGAV0DkwEqAxwSawEZLgItOgJZDthRWgDRamtlIv+9XlkRXbocC+Ls2cLaf8uDDObB96U5z5KrlQk+GB0VdJMkDVJhQdgTruIXn+2ofwI0SCPvRNRgQuLEKbWV/Fg+V8becZwsM9bQ8iODEWKNq9ioacd5oLRpi6jrIn8Gt0pcKoZL7QKYedtQtsn5c9W0f+x49EOZTqQD1gh2D7nxy5NJc6R9gKfPH0YEB0cLe9KD/Vs7XgZmwIffNZFXSpFOMC8xGTMhKON+ASuhUwG9LcpsvsqyIwVK9avAMqh7NSo4Yne6wgFM051a0TKRXnmtcd0STANGpysKoK12fvwaNeNkd3SQrUqX16UfDzEyepQhxDt/Sr4ZT1ozNZnm8cAN0RVF8aG+j+jjcN8u+jkdd2vYbP7WAFsNZq07SZh4DeVbHYRZuoOkIrZL6PAAfTMCimqFCWiErN6uD7C/DixYxW71bSTP+4fFB9X86bxagst0BKVSArLAXQVJdPbe7CND6svubOEGaaP3lULzU38XecBYe5YGOfwBXgROTKeBrOlLcEzbE0Wutb3XABOQWxEAn11jDrwlF/IdaqyBzbWi+m4G1jO2bnKHY7IfN8WBGDd8hk6fYYN682kzvz3e/myfe0nu/2LFQbnqywRes/RqDwfzvHTzgdE17kAHrUjDtueBvdN8ug2jzg21SWaMLvs4+cp/NBWiHcC9t3bpkB9WwmWGpn2XcB3h3wCJThZVj1f0fFucInZ1x4+opRCaIUl89gWGOuGc8y8PayYSFKDSxbaEQOKBz+cFob+BR8Gl8RL0MTGZyQwZfDSzkf0SkdIkbBFePdvXE36sAx7+EtJwf0zYmyLCFsrPOca0VARzohMZH05BAcaCZwqrGQKVFdtVDNnnjDk7wkh5Ov5zwBRrXI5EanZZmfAAoSYLIpg/u3GHlYUK2ryJb+5BbwcEgujzQMCzx75xdWrApsM0T2Dw9GrftwUQ1+EcE5G7JnfkVFcjuz9bMCVAI7tbP7biu0hUOH7frw7ZanfZjRiB1CcGdhpw6laT6XhNZcMGHXSiYGu6ZHtTYhYAajA5ApMLu4+LKWUA+hGJ/89hCXQUKnyQApGl7nuC09XgpPGGLdsh1mxwz1xu5XfXewIucR5ByxWlflOGGDyc+A7YlwUsj6iNp8f/7bqcih3gRfInyGB9do568eZaNIKb2LVBYxiuLuzyntTAN/irtffYgTieqhYXHl0J1BMr9fhBz5yn84vvw8VSKLMCHIs25gNjpn1JR/Daf7UzcB8WELrDx1Tf7A8ffs7lWp3AdY9jA2FGsjSYxQUOoptJBTmuMn9n8Qbzdtu+FaAwrIDKDcxg8zeQJYRkjGZv9g+yVFWHnLv+2vSNMqq+BT+Z1rDT9cDdBVJg60xovNgEJiup8hfCa+mDCzmQMwKxZNZVF9aruveuejvDxokDX2K2EyeYlhaaG8rWGhtsds43BtgfFibDrDHbvpoBV3+9vJt0B2nnOr6fVa5G1SkePQVluzqeIgsUARoKxuItrSddyTQutro2dFCPrwwfZ7CzlW9ubKxapQ7gFUGQLWM3oUY0slHhZFIFKotg3hvOxPoQGiOxG4E2W5+UGu688bsIXW7Hl5wWKgRJnceBePp4zKp3NDxd8VmOgO5F2VNvWaPlM7jXIMBbuYBnDpAUMqnwyc5bqI7HDwKTrWkLEj45KztLiF11z0wa1/fvCFAOHvzbs9BlWiW+QGiR+Y6+aa6/cdx7VdeCw5UK23AGYQr8+xX5vCUckqS0UkJCxm92a7dsyo8pouTc176w4nbMLQqWPha+W3popdRT/93Ssjg3oKaAnOvRL6z/9N5wjFt49oN0P852XMnK3UL8ZGzzi1gd+FkUjbifB2GX8Grc/8XHrneiOtXR2xHl/TfGMawnJg4WQXnzQq3eQUBJz9NbC2Gg+dGNkpXVHaToAcxOqvlMu0CSA0Qkg3ef2RFznbGuLR2PDrm+AxDr+Qo4pcCMl/M/E7lyPXeiOLN6iXO5AmhGXhzgte8ygiIkicdoXWdqGRdcrX7ctfu58J8Zmkgks9p77eZw/tx/eHTY4tNNC+1YAhV+26nieVQCYSUYl8YHK1uuZGgV5KbjuzUULJeCQY8BlIm/80ybbyYDy+4SUW+mGBl3EtTT9smXVR7UoK5KObSzWgrCG4wAqZ9CkEuQalLAI/OsNrPN6ze2hJ4M7hGM2iRdC6opjSTKPaNJ7zY5rRmurNyH/7aIR5dC0MNDrLY+sVnKZQWv+gboeqZzlquE2/1NZoMCj2lsoSc79r3tdFaOoO9ZRyanwSWOdx2XqxyfwNA8KkNkedEWF9DkplkYnJEHDiJZdYLQ1agAOjKPEpLplJwxiMrB+h3a6ruuM96SKbckL6XPCzSQiUKglHbUzT9Gh1ggLa6XWZfjuVt/IfnnHwoWgt62L+IBoU3y71t1641UQChMSUEbkpjjVRTKFthGHzBhDlq41T1hdtleDGIQV8UCuiC/5GgB7Zx7o0xPKGqm7j18G+GlX2WwLtIWd8YqUNlv+HnohiRx+Vk/9C1vy11z9jjtcc6fiF9buPnM6qPyFjow/h/c1v2prN/3wSXh3rH9GolYFoSooCqGwOx3DjpRqSAygW/v4PUHZJyYxP14/Ln54Lv9f9+0OcPbNS6c2vqmElNdPfxP8QMtNX3XEfEKElyd/HxY4FYTs/AqcCui30ktKEHYXHewFDPQaJiGwcDYB9F5jeygAgoTAjhhlxeptHUxp16PPnRwVj44ocA1NvTQ0FDlvFahGmgG6Aj2ddN4UJ0b0tS5YyKLtBIhBqABEnSMbMOOWXZyKUoYFKvbxL79nhUift31MDodlmD6BPpSgOOw5Eccg+zfJgbLYA65uhSmhMydKlNxWbd5f+i0UBEqZvZTM0NDLrU2PIuXwnubTQfRlw52VPjuPVI49PgqMxjRpKBFCqyqA99k72oMthB42YaxdbGIMSjD6zSNcRIr6Bl1MCWw7e3PiB2UmCed7ijbhFbWhV68FQXlYGUZuqx53uWppQ3u7yTwAXjHGAlCZGTQLRYeNioJCKxeK91osLRTWnGe709Ef104z4IfuHkjAX2sWraAN74cmM/ORVOLnpp/J7Y2kk/u2QqfvqoNNk8L4+VT0kVhQyiViILzLqzbGjuGQPmHjV8r5QwHojbwpPizkHWTA2xha8nOc3mbkuM6H9uEYKFsULhKIuIjUnIdi9hPUHJIT6ed8ZGIjNQG1Wn4CjPlUUZ8uGR0luDEACyNZxdFo/QPsRi/wKQSNNswqfNSFJkyMGoEGXOkR/ucQSseK9XqPdiQFR/qNzL0qRN1KjPQTv0CQxoGCIDMIYrpVV8zpLGCNpput79ZwDTuW4in2D/IOjeVvc7pFCXEb+2UhEhXSYaHx9r/Y7JkRwdmjzdSAao7LyW8+l+7qJgrCG3Dle08lZjk4YH2MvV++MigvhRYzceLUyjOjkYOZ4o1tmfDFzTkf5cSdkl0rXqxH92o9gvm18H6/Si173Es5xZ513AkVBJGDylcu/q/B5eZt+xwS8BTshrL4bx6VaGudVZMizz/612MW4AUUkSaSXK/ELu0FDOYsUxNP1tQ1/Gpz4N9wGv05/4ujpE+fLbrrgkzr27/pXJese3TbHJKwEgUcjauCuz4/hunhcEvsjsRbvep4MnrF2KcVIP9fK4dG+vRR7HwPcf7fILl7Q8vx79LKKrlIeCPKO5kRE+urw4d+2zYfdKWykQv30cG9KVCYla5BqNQoOSn1xXyjQ7qfGiDlR1XZqEr0ibk7F7G4ZEzzL56guiK3zAGdD7hYjR5Aj8fcf4pnHXL5NcMz/8dxYE7x6MWB9XkEtn0EUWx27sP+oSpvAwz5rLd3Tz1UnFrgVh6oiOpYBD6TkOdyckwoQ69AdSEvqZTK5LAEPAuHm8lQ2234pmorvYcc8pIe66EdYhkxxsKlXFrNFqtIuuUXJ+OfzHGAL1pu7CHHqiwyyRABOapW/1wqiwAVmPXFN2SqU7gR1S7Z+3TGNBbuwPDXXV7PSAodMJaZq6wj/gMUm85+26FDu2Y7uY91e+5Ji4lwtPv1uG1yaEetG0Xy/faV522sHl/fC2FYjFWQDAQ23uT9RxKIVVkWA9cl6vWHmJCQ9ceewra/7DxydV1ny+WQSv3962xc9i3EeXAAsdQI9SrYOk0jFJNOhm+qeztYREAaBESsXJ9JI5T5zniZnb2swvB4lwaEpSQZgeJ2pAD0KlR5rK8Hf0HkS2/hKuD1EJOo0Qfg5QyRaqCU9anWQp8qrIrzNWg6y5a47BEfPZnrNe+Bqvt3I/i0+Dl4RtgyWTKPDR6Q1uH70rrY14s1tafZfRWjbo6TSOTUnFkMvbEQPn0oF5EtDvjh2mFE+f91qchbYWcD3JYQTOl7y0FWnEXYulpWDqvZof0N7Pafi6uS6xjEfh1jNiavyhmt2WHcD801TFtyKtawPjQ3O4fIT9W8hAnKsHlyuubOW1zOoQ4x9+dYWaarmJ8IqwkZeuzQXayuXj8UlmX/f/yW1h3n/Gdx/3HI4bAGb/mm3t01jAmfOS/Oyj4yFjtBQ4nwcGpxRwiAPojxkJOBBZk3VeiW8JvTXnZKy1FY4XC4tRkElP4fotBc/x0x9fbf4CqfHaUVPHyWmDm/S6BcAFyzP3uQ9WoB+2jc95EjPKNIvtAN3Q9XbOjWvWW/XJEVxtMSPDnqew4lO3LNz2obYki7f9CWqDEnrBMA4qIt5jZaApdjbFM1YSNMS030Rgnu4iCNRMuCn6aAdHXT9TRslmxdCxgxOy9N/98xL2pERPv5OGE17E+DuNYdPrN4MwNkOtIjbAjJb8Hs8LY9/XfOW9d11j0FwJv6Ef/ep6pvXlIB3vdErEvlYCSZ5DRdn1HGY5bUz2QaiUzRH0LJdEKQI+frzCaKLKnf4f5rwOlxY+P+4iex9OEINStlYcqs+EIXHcNn0S4RTWUYl5jWsS1PSYMS7ypCzCGQsqrXU8WwWYKb2rIjBKyBBh3Wiv93sZkLbg5L2bkfYMNrSai2nNAL8cyd4U/BqN8LBHtEvRABQhwguUJ4xvgmMledpMj5gAAH1hfMAEUARAbgAQAyoIAAACABIAAYNCABAQKAAAAAMAAEAARCCBAAYAEAYAhwAQAAQAAEAiAAAIAAQAABAgJCAABARggQQAAAEAgEeUAAAgQAgkGJoAgAAAAAABEUBAjARAAAAAAEwAAAAtub3RvLTAxLnN2ZwAAAAtub3RvLTAyLnN2ZwAAAAtub3RvLTAzLnN2ZwAAAAtub3RvLTA0LnN2ZwAAAAtub3RvLTA1LnN2ZwAAAAtub3RvLTA2LnN2ZwAAAAtub3RvLTA3LnN2ZwAAAAtub3RvLTA4LnN2ZwAAAAtub3RvLTA5LnN2ZwAAAAtub3RvLTEwLnN2ZwAAAAtub3RvLTExLnN2ZwAAAAtub3RvLTEyLnN2ZwAAAAtub3RvLTEzLnN2ZwAAAAtub3RvLTE0LnN2ZwAAAAtub3RvLTE1LnN2ZwAAAAtub3RvLTE2LnN2ZwAAAAtub3RvLTE3LnN2ZwAAAAtub3RvLTE4LnN2ZwAAAAtub3RvLTE5LnN2Z/////8AAAAFAAAJR4TIttQwTa1YAjTnMNDYGTEU+QRRyRUhZGAEDgEQKEFJohZBi6gUwGPugfVabCQtIltTCcT03lIhIikSYxEVZJp0BkYJlEkNSGnQQUyK16RbpqFEIBujsFHagO0oE9mRAzrJ3mFDyvaAXAU2AJlSSpzQzkrHEWdOiWVEh6RsQAwyIEouMaDeAnGIlJocppHEAnNyiLjYYeewVJxUciwmijmOjReJaw+chV6SR43TIFzQlXHOANKtAdoRL6i4EIAAKilVQ6bIR0AkBh2YGErGSJSaGsNFwQ5hochUEjzBQXWYWqgcUqABST4EQguysQSgVIwB+Jg6xDw0nJQBgGJeCiHFIQ0xwwjVwlEpocNSLOa4Z4Rz6gEHEUQkFRBRSXHBlwQJRQxhhAGxxMQCkmCEAmQhITUWUxIHPeciDHAQExI0MAbmnnopkvgSgG4kScobjSBpQmyShSKVW04igSJryrVgxouREMQiaKSoRQQ6gokGkBntyeLCgiasZZ4pIbFTzljmSRIee0O+hQCSzIkVnYyBpQbWi2IwEcop6awyiBiyBbZKKmUhOYKQRiUn3oumsdXkOgAkCFULEKWAjBxAnBNRWM2gMEiQQCEADiQGEGEMKEelKBI5EAiDxmurOARhlDIQ0AaBbJFymEQvClFee1C0BJRRQgbBZDLwveSICasotcggKzxwoIumJaiWIqGM4pCLEbCiHiwmIPGUigueSMZiMI3zGooxEHIOPCGKZ5BzCMQViEouIPniQm1FsQgKLkLHlmGCOCaYkoghJlo7zpEkIHwJJTHCCXGp6ORy8TiGUIpHNsiII6oAUUA6TcbAljDDjRNGkkfEFGUEECxxyhkRgbHgkUIWcZhYUiQywDDtGAKAC6slgJwJMiS0npFBLgJYNDI6CRAQ4qjoFCowFZnCkKGcIUQDpZEXijNpDdFGIiceBKJIbw2iEjxADXRkewc+GUprBpQRhQlNtbEgg0QOtIyLDhIy5EnLyXOkKMO5VQKBoESEDISgnAcKaCJFlwCEAhhnnAJqQVOgAgSFBt5jKsUUWyByidHAKbCs0lo0zZ0SoTGDscdKeE7BwkorTQjx4CGQrUYAeScUBY5sAqQEAjTrGSIiA/Ao2dBQxpVAAhIrFPYkCM0QRFZkITCW1FkEKTOCYguQg8hRx8A1lllqjNfiGAMWFA88TTZgjFrjJBKbGiGIRlaLqzkliAJIRZIaCkeVch4Doh2pxhpiIefYSy8aI2MYERYGC4tRuKegXIgNQVRwo7AWGnBDMgXWOglGcUZQprwmYxAupHGcEy8FlBp8cJCX0lnHCZXUKAXBVtwCpjHCYpEmFSgcSqI1GEdpSJzxEDOBmTcCCeuoqEQRgLEBoQEyJQckQ61BKIMLIbymoJMuPIaSUYyhteIYMLoE1CgSKglMBM8UKIkqTjWkhnOjlCZCWmMc9cJRsZSiFghCDfZGQUyw89Z7kR2ChDFivFfOOccMBcuIaJm3BFuRwBJVIkcBKBkoTkSCljRyDWeYiUAN+YRIMIpHjhERsCRlTKRIVgiESoLD4ipAHaSMMTHCFl1SxRwjlVlRJBSYOQwoFxc6yoASIWFHQAOHecGpRRKTrYlD2nqyufBOc045ksqAzAgjBHDjAHQYWk4hkYJ5rBUYyIJogYaGa8c8AQFJKY7iFGhBtQTCAwim94YzkDwVYHlRgQafUEm59txA8jzkFgSoOAlkI4eVAQcbCgSiIoHQOPheaWWleAxprSCWDgNHMunYcyC5QlIgRK73AGAJOTlKfCAs5RY6ypki3SNEITfaIYe1E1Qix0gX3pIvtsgEgaoxF2NMipAUADFNJCBVLGMFksJpQ0I2SpEAoSaOKIbAJ8QZ5xxXCjACyTeSS+QJuQBEUTAhnUkKNpXaekkJIh8SkDwllzBjBZVAQ0GiqFB0JTQgCllBPDCcKkOe1wpcsT0VTQjxCORQMiQQ4JBSRiJpoIORDXMgkyAc5dYYBI0YlYIOjQcKUa+5Z8JCboB4hhjmpOPkWGPIY6J5EqRFBAxBNabKgsENOEaBEg4DY2MmKjKiSSApI6BcrwmwXBOCNaCEieyst9wi4znTVGQKitYKECXIJJwZIUDgIAghvkRWcEA1lo6EhK2hSFowGYKaOBAtJ0dibgFgnnqDAAZjkiixgph0TaQTggpuJSPlQyUg4worBaLoIjAMFAefYFAwEKBcLMBEWETDhcXWIgcYxJoYA4QCnlQDQQPKaGcEddZrTKZA0GESwBAfEeos5+AiEriATEAwpmbgWki9UowQCRGQwJGrnYHQkrFARqQpBMnowmvHkfECkSCpg9xazbmUzFHkEdEUXO8FWIBI7EHDHiIFPQTlcuPAVgJKkrjBABvACSAkjGG94BiEYjgVnGkDDFgESTC9gWJoBz4B1nAECaHCEMbBA5ozwzmjZDAMwbQce8QEoCB8UDigWJErGiYQKiCS9hoQiBDFpCgSgBTXSZCh9qJQTYhRCFsuMgjJiKqtc8hiyDgljmywSLmOazHAiFBq6z2CRJHqrMTcOcacAE4pSr2g2IvPkLCEFA6lt1BrpzG5ihEsIDHKI1DGxqBbSzAWHixRCKTIMmyIFE1ESiZGZJKLJcacMUmtMoB8QqEI4jkmgiGAWIWwJ01bjrnQYDitEMIigfLI4VAzxrhRIEAAOgjUWe+lpyIwhTGIggtOHIDgGjAFc8IyISIigHEvkqBMTA6CFZVLLUZkxCPAGSQla8GoQ5A7L6QgkCjEqdcIOukUKYBsRZjUXGikPPkkaQsAs0YBCqaDImIkIgHVG1FEVsiIL7F3AHskklQeRKgFZ84gqgXIHIliCJMKeK84CZccUAUoUEGAHEdEeyuQQ4SC5DF20nnxoJBCAmQMI6UJz4QYlAlPOChSGFIMVoiQzyiBGoHFqNiGUisggZZsUZEWYkIpQRnJYKERBlVAZJnGXhkpRknIKrDFYlqRqjE4wnhDKFYkWSqFUFIsKaG1GloPsQIKEGC8glIszryCFDDxjVHMUYHFBUJUsi0nQCnnvORKQWkVuEBD6MmVhGissTLeYYahpBqK6KBVDnotpSAeUysY9qIx6rlzFjpxMCJYSiQItxZByTmDVBhrgJHSKy4AcMJrSqwWjVmmSccWIGeUdWQjiSEiGyDjGZjiewpGIlc7AAAAAA==";
var chunks = {
  "noto-01.svg": new URL("./noto-01.svg", import.meta.url).href,
  "noto-02.svg": new URL("./noto-02.svg", import.meta.url).href,
  "noto-03.svg": new URL("./noto-03.svg", import.meta.url).href,
  "noto-04.svg": new URL("./noto-04.svg", import.meta.url).href,
  "noto-05.svg": new URL("./noto-05.svg", import.meta.url).href,
  "noto-06.svg": new URL("./noto-06.svg", import.meta.url).href,
  "noto-07.svg": new URL("./noto-07.svg", import.meta.url).href,
  "noto-08.svg": new URL("./noto-08.svg", import.meta.url).href,
  "noto-09.svg": new URL("./noto-09.svg", import.meta.url).href,
  "noto-10.svg": new URL("./noto-10.svg", import.meta.url).href,
  "noto-11.svg": new URL("./noto-11.svg", import.meta.url).href,
  "noto-12.svg": new URL("./noto-12.svg", import.meta.url).href,
  "noto-13.svg": new URL("./noto-13.svg", import.meta.url).href,
  "noto-14.svg": new URL("./noto-14.svg", import.meta.url).href,
  "noto-15.svg": new URL("./noto-15.svg", import.meta.url).href,
  "noto-16.svg": new URL("./noto-16.svg", import.meta.url).href,
  "noto-17.svg": new URL("./noto-17.svg", import.meta.url).href,
  "noto-18.svg": new URL("./noto-18.svg", import.meta.url).href,
  "noto-19.svg": new URL("./noto-19.svg", import.meta.url).href
};
register("noto", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
