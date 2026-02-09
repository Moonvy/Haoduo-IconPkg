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

// iconpkg/glyphs/src-index.ts
var lookup = "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";
var chunks = {
  "glyphs-01.svg": new URL("./glyphs-01.svg", import.meta.url).href,
  "glyphs-02.svg": new URL("./glyphs-02.svg", import.meta.url).href,
  "glyphs-03.svg": new URL("./glyphs-03.svg", import.meta.url).href,
  "glyphs-04.svg": new URL("./glyphs-04.svg", import.meta.url).href,
  "glyphs-05.svg": new URL("./glyphs-05.svg", import.meta.url).href,
  "glyphs-06.svg": new URL("./glyphs-06.svg", import.meta.url).href,
  "glyphs-07.svg": new URL("./glyphs-07.svg", import.meta.url).href,
  "glyphs-08.svg": new URL("./glyphs-08.svg", import.meta.url).href,
  "glyphs-09.svg": new URL("./glyphs-09.svg", import.meta.url).href,
  "glyphs-10.svg": new URL("./glyphs-10.svg", import.meta.url).href,
  "glyphs-11.svg": new URL("./glyphs-11.svg", import.meta.url).href,
  "glyphs-12.svg": new URL("./glyphs-12.svg", import.meta.url).href,
  "glyphs-13.svg": new URL("./glyphs-13.svg", import.meta.url).href,
  "glyphs-14.svg": new URL("./glyphs-14.svg", import.meta.url).href,
  "glyphs-15.svg": new URL("./glyphs-15.svg", import.meta.url).href,
  "glyphs-16.svg": new URL("./glyphs-16.svg", import.meta.url).href,
  "glyphs-17.svg": new URL("./glyphs-17.svg", import.meta.url).href,
  "glyphs-18.svg": new URL("./glyphs-18.svg", import.meta.url).href
};
register("glyphs", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
