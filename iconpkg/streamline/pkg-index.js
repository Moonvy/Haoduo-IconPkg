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

// iconpkg/streamline/src-index.ts
var lookup = "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";
var chunks = {
  "streamline-01.svg": new URL("./streamline-01.svg", import.meta.url).href,
  "streamline-02.svg": new URL("./streamline-02.svg", import.meta.url).href,
  "streamline-03.svg": new URL("./streamline-03.svg", import.meta.url).href,
  "streamline-04.svg": new URL("./streamline-04.svg", import.meta.url).href,
  "streamline-05.svg": new URL("./streamline-05.svg", import.meta.url).href,
  "streamline-06.svg": new URL("./streamline-06.svg", import.meta.url).href,
  "streamline-07.svg": new URL("./streamline-07.svg", import.meta.url).href,
  "streamline-08.svg": new URL("./streamline-08.svg", import.meta.url).href,
  "streamline-09.svg": new URL("./streamline-09.svg", import.meta.url).href,
  "streamline-10.svg": new URL("./streamline-10.svg", import.meta.url).href,
  "streamline-11.svg": new URL("./streamline-11.svg", import.meta.url).href,
  "streamline-12.svg": new URL("./streamline-12.svg", import.meta.url).href,
  "streamline-13.svg": new URL("./streamline-13.svg", import.meta.url).href,
  "streamline-14.svg": new URL("./streamline-14.svg", import.meta.url).href,
  "streamline-15.svg": new URL("./streamline-15.svg", import.meta.url).href,
  "streamline-16.svg": new URL("./streamline-16.svg", import.meta.url).href,
  "streamline-17.svg": new URL("./streamline-17.svg", import.meta.url).href,
  "streamline-18.svg": new URL("./streamline-18.svg", import.meta.url).href,
  "streamline-19.svg": new URL("./streamline-19.svg", import.meta.url).href,
  "streamline-20.svg": new URL("./streamline-20.svg", import.meta.url).href
};
register("streamline", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
