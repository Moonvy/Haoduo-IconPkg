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
var lookup = "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";
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
