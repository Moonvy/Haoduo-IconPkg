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
