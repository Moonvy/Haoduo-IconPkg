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
