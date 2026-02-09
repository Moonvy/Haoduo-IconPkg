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

// iconpkg/fa7-solid/src-index.ts
var lookup = "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";
var chunks = {
  "fa7-solid-01.svg": new URL("./fa7-solid-01.svg", import.meta.url).href,
  "fa7-solid-02.svg": new URL("./fa7-solid-02.svg", import.meta.url).href,
  "fa7-solid-03.svg": new URL("./fa7-solid-03.svg", import.meta.url).href,
  "fa7-solid-04.svg": new URL("./fa7-solid-04.svg", import.meta.url).href,
  "fa7-solid-05.svg": new URL("./fa7-solid-05.svg", import.meta.url).href,
  "fa7-solid-06.svg": new URL("./fa7-solid-06.svg", import.meta.url).href,
  "fa7-solid-07.svg": new URL("./fa7-solid-07.svg", import.meta.url).href,
  "fa7-solid-08.svg": new URL("./fa7-solid-08.svg", import.meta.url).href,
  "fa7-solid-09.svg": new URL("./fa7-solid-09.svg", import.meta.url).href,
  "fa7-solid-10.svg": new URL("./fa7-solid-10.svg", import.meta.url).href
};
register("fa7-solid", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
