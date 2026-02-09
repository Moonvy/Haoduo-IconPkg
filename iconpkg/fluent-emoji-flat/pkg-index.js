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
