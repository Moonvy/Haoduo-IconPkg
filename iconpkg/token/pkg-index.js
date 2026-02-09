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

// iconpkg/token/src-index.ts
var lookup = "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";
var chunks = {
  "token-01.svg": new URL("./token-01.svg", import.meta.url).href,
  "token-02.svg": new URL("./token-02.svg", import.meta.url).href,
  "token-03.svg": new URL("./token-03.svg", import.meta.url).href,
  "token-04.svg": new URL("./token-04.svg", import.meta.url).href,
  "token-05.svg": new URL("./token-05.svg", import.meta.url).href,
  "token-06.svg": new URL("./token-06.svg", import.meta.url).href,
  "token-07.svg": new URL("./token-07.svg", import.meta.url).href,
  "token-08.svg": new URL("./token-08.svg", import.meta.url).href,
  "token-09.svg": new URL("./token-09.svg", import.meta.url).href,
  "token-10.svg": new URL("./token-10.svg", import.meta.url).href
};
register("token", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
