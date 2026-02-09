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
