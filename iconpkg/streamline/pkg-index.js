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
