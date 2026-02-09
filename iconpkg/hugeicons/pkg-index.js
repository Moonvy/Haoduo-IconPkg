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

// iconpkg/hugeicons/src-index.ts
var lookup = "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";
var chunks = {
  "hugeicons-01.svg": new URL("./hugeicons-01.svg", import.meta.url).href,
  "hugeicons-02.svg": new URL("./hugeicons-02.svg", import.meta.url).href,
  "hugeicons-03.svg": new URL("./hugeicons-03.svg", import.meta.url).href,
  "hugeicons-04.svg": new URL("./hugeicons-04.svg", import.meta.url).href,
  "hugeicons-05.svg": new URL("./hugeicons-05.svg", import.meta.url).href,
  "hugeicons-06.svg": new URL("./hugeicons-06.svg", import.meta.url).href,
  "hugeicons-07.svg": new URL("./hugeicons-07.svg", import.meta.url).href,
  "hugeicons-08.svg": new URL("./hugeicons-08.svg", import.meta.url).href,
  "hugeicons-09.svg": new URL("./hugeicons-09.svg", import.meta.url).href,
  "hugeicons-10.svg": new URL("./hugeicons-10.svg", import.meta.url).href,
  "hugeicons-11.svg": new URL("./hugeicons-11.svg", import.meta.url).href,
  "hugeicons-12.svg": new URL("./hugeicons-12.svg", import.meta.url).href,
  "hugeicons-13.svg": new URL("./hugeicons-13.svg", import.meta.url).href,
  "hugeicons-14.svg": new URL("./hugeicons-14.svg", import.meta.url).href,
  "hugeicons-15.svg": new URL("./hugeicons-15.svg", import.meta.url).href,
  "hugeicons-16.svg": new URL("./hugeicons-16.svg", import.meta.url).href,
  "hugeicons-17.svg": new URL("./hugeicons-17.svg", import.meta.url).href,
  "hugeicons-18.svg": new URL("./hugeicons-18.svg", import.meta.url).href,
  "hugeicons-19.svg": new URL("./hugeicons-19.svg", import.meta.url).href,
  "hugeicons-20.svg": new URL("./hugeicons-20.svg", import.meta.url).href,
  "hugeicons-21.svg": new URL("./hugeicons-21.svg", import.meta.url).href,
  "hugeicons-22.svg": new URL("./hugeicons-22.svg", import.meta.url).href,
  "hugeicons-23.svg": new URL("./hugeicons-23.svg", import.meta.url).href,
  "hugeicons-24.svg": new URL("./hugeicons-24.svg", import.meta.url).href
};
register("hugeicons", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
