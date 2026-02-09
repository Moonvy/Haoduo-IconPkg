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

// iconpkg/fluent-emoji-flat/src-index.ts
var lookup = "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";
var chunks = {
  "fluent-emoji-flat-01.svg": new URL("./fluent-emoji-flat-01.svg", import.meta.url).href,
  "fluent-emoji-flat-02.svg": new URL("./fluent-emoji-flat-02.svg", import.meta.url).href,
  "fluent-emoji-flat-03.svg": new URL("./fluent-emoji-flat-03.svg", import.meta.url).href,
  "fluent-emoji-flat-04.svg": new URL("./fluent-emoji-flat-04.svg", import.meta.url).href,
  "fluent-emoji-flat-05.svg": new URL("./fluent-emoji-flat-05.svg", import.meta.url).href,
  "fluent-emoji-flat-06.svg": new URL("./fluent-emoji-flat-06.svg", import.meta.url).href,
  "fluent-emoji-flat-07.svg": new URL("./fluent-emoji-flat-07.svg", import.meta.url).href,
  "fluent-emoji-flat-08.svg": new URL("./fluent-emoji-flat-08.svg", import.meta.url).href,
  "fluent-emoji-flat-09.svg": new URL("./fluent-emoji-flat-09.svg", import.meta.url).href,
  "fluent-emoji-flat-10.svg": new URL("./fluent-emoji-flat-10.svg", import.meta.url).href,
  "fluent-emoji-flat-11.svg": new URL("./fluent-emoji-flat-11.svg", import.meta.url).href,
  "fluent-emoji-flat-12.svg": new URL("./fluent-emoji-flat-12.svg", import.meta.url).href,
  "fluent-emoji-flat-13.svg": new URL("./fluent-emoji-flat-13.svg", import.meta.url).href,
  "fluent-emoji-flat-14.svg": new URL("./fluent-emoji-flat-14.svg", import.meta.url).href,
  "fluent-emoji-flat-15.svg": new URL("./fluent-emoji-flat-15.svg", import.meta.url).href,
  "fluent-emoji-flat-16.svg": new URL("./fluent-emoji-flat-16.svg", import.meta.url).href
};
register("fluent-emoji-flat", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
