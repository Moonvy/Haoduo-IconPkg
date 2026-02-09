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
var lookup = "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";
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
