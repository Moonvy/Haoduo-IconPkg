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
var lookup = "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";
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
