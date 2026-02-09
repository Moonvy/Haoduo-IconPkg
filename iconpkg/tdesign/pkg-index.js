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

// iconpkg/tdesign/src-index.ts
var lookup = "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";
var chunks = {
  "tdesign-01.svg": new URL("./tdesign-01.svg", import.meta.url).href,
  "tdesign-02.svg": new URL("./tdesign-02.svg", import.meta.url).href,
  "tdesign-03.svg": new URL("./tdesign-03.svg", import.meta.url).href,
  "tdesign-04.svg": new URL("./tdesign-04.svg", import.meta.url).href,
  "tdesign-05.svg": new URL("./tdesign-05.svg", import.meta.url).href,
  "tdesign-06.svg": new URL("./tdesign-06.svg", import.meta.url).href,
  "tdesign-07.svg": new URL("./tdesign-07.svg", import.meta.url).href,
  "tdesign-08.svg": new URL("./tdesign-08.svg", import.meta.url).href,
  "tdesign-09.svg": new URL("./tdesign-09.svg", import.meta.url).href,
  "tdesign-10.svg": new URL("./tdesign-10.svg", import.meta.url).href,
  "tdesign-11.svg": new URL("./tdesign-11.svg", import.meta.url).href,
  "tdesign-12.svg": new URL("./tdesign-12.svg", import.meta.url).href
};
register("tdesign", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
