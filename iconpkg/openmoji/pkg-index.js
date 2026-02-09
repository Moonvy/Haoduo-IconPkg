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
