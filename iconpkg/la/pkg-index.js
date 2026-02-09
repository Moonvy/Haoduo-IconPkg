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

// iconpkg/la/src-index.ts
var lookup = "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";
var chunks = {
  "la-01.svg": new URL("./la-01.svg", import.meta.url).href,
  "la-02.svg": new URL("./la-02.svg", import.meta.url).href,
  "la-03.svg": new URL("./la-03.svg", import.meta.url).href,
  "la-04.svg": new URL("./la-04.svg", import.meta.url).href,
  "la-05.svg": new URL("./la-05.svg", import.meta.url).href,
  "la-06.svg": new URL("./la-06.svg", import.meta.url).href,
  "la-07.svg": new URL("./la-07.svg", import.meta.url).href,
  "la-08.svg": new URL("./la-08.svg", import.meta.url).href
};
register("la", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
