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

// iconpkg/noto-v1/src-index.ts
var lookup = "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";
var chunks = {
  "noto-v1-01.svg": new URL("./noto-v1-01.svg", import.meta.url).href,
  "noto-v1-02.svg": new URL("./noto-v1-02.svg", import.meta.url).href,
  "noto-v1-03.svg": new URL("./noto-v1-03.svg", import.meta.url).href,
  "noto-v1-04.svg": new URL("./noto-v1-04.svg", import.meta.url).href,
  "noto-v1-05.svg": new URL("./noto-v1-05.svg", import.meta.url).href,
  "noto-v1-06.svg": new URL("./noto-v1-06.svg", import.meta.url).href,
  "noto-v1-07.svg": new URL("./noto-v1-07.svg", import.meta.url).href,
  "noto-v1-08.svg": new URL("./noto-v1-08.svg", import.meta.url).href,
  "noto-v1-09.svg": new URL("./noto-v1-09.svg", import.meta.url).href,
  "noto-v1-10.svg": new URL("./noto-v1-10.svg", import.meta.url).href,
  "noto-v1-11.svg": new URL("./noto-v1-11.svg", import.meta.url).href
};
register("noto-v1", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
