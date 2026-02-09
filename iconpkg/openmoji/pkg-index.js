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

// iconpkg/openmoji/src-index.ts
var lookup = "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";
var chunks = {
  "openmoji-01.svg": new URL("./openmoji-01.svg", import.meta.url).href,
  "openmoji-02.svg": new URL("./openmoji-02.svg", import.meta.url).href,
  "openmoji-03.svg": new URL("./openmoji-03.svg", import.meta.url).href,
  "openmoji-04.svg": new URL("./openmoji-04.svg", import.meta.url).href,
  "openmoji-05.svg": new URL("./openmoji-05.svg", import.meta.url).href,
  "openmoji-06.svg": new URL("./openmoji-06.svg", import.meta.url).href,
  "openmoji-07.svg": new URL("./openmoji-07.svg", import.meta.url).href,
  "openmoji-08.svg": new URL("./openmoji-08.svg", import.meta.url).href,
  "openmoji-09.svg": new URL("./openmoji-09.svg", import.meta.url).href,
  "openmoji-10.svg": new URL("./openmoji-10.svg", import.meta.url).href,
  "openmoji-11.svg": new URL("./openmoji-11.svg", import.meta.url).href,
  "openmoji-12.svg": new URL("./openmoji-12.svg", import.meta.url).href,
  "openmoji-13.svg": new URL("./openmoji-13.svg", import.meta.url).href,
  "openmoji-14.svg": new URL("./openmoji-14.svg", import.meta.url).href,
  "openmoji-15.svg": new URL("./openmoji-15.svg", import.meta.url).href,
  "openmoji-16.svg": new URL("./openmoji-16.svg", import.meta.url).href,
  "openmoji-17.svg": new URL("./openmoji-17.svg", import.meta.url).href,
  "openmoji-18.svg": new URL("./openmoji-18.svg", import.meta.url).href,
  "openmoji-19.svg": new URL("./openmoji-19.svg", import.meta.url).href,
  "openmoji-20.svg": new URL("./openmoji-20.svg", import.meta.url).href,
  "openmoji-21.svg": new URL("./openmoji-21.svg", import.meta.url).href,
  "openmoji-22.svg": new URL("./openmoji-22.svg", import.meta.url).href,
  "openmoji-23.svg": new URL("./openmoji-23.svg", import.meta.url).href
};
register("openmoji", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
