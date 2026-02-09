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

// iconpkg/twemoji/src-index.ts
var lookup = "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";
var chunks = {
  "twemoji-01.svg": new URL("./twemoji-01.svg", import.meta.url).href,
  "twemoji-02.svg": new URL("./twemoji-02.svg", import.meta.url).href,
  "twemoji-03.svg": new URL("./twemoji-03.svg", import.meta.url).href,
  "twemoji-04.svg": new URL("./twemoji-04.svg", import.meta.url).href,
  "twemoji-05.svg": new URL("./twemoji-05.svg", import.meta.url).href,
  "twemoji-06.svg": new URL("./twemoji-06.svg", import.meta.url).href,
  "twemoji-07.svg": new URL("./twemoji-07.svg", import.meta.url).href,
  "twemoji-08.svg": new URL("./twemoji-08.svg", import.meta.url).href,
  "twemoji-09.svg": new URL("./twemoji-09.svg", import.meta.url).href,
  "twemoji-10.svg": new URL("./twemoji-10.svg", import.meta.url).href,
  "twemoji-11.svg": new URL("./twemoji-11.svg", import.meta.url).href,
  "twemoji-12.svg": new URL("./twemoji-12.svg", import.meta.url).href,
  "twemoji-13.svg": new URL("./twemoji-13.svg", import.meta.url).href,
  "twemoji-14.svg": new URL("./twemoji-14.svg", import.meta.url).href,
  "twemoji-15.svg": new URL("./twemoji-15.svg", import.meta.url).href,
  "twemoji-16.svg": new URL("./twemoji-16.svg", import.meta.url).href,
  "twemoji-17.svg": new URL("./twemoji-17.svg", import.meta.url).href,
  "twemoji-18.svg": new URL("./twemoji-18.svg", import.meta.url).href,
  "twemoji-19.svg": new URL("./twemoji-19.svg", import.meta.url).href,
  "twemoji-20.svg": new URL("./twemoji-20.svg", import.meta.url).href,
  "twemoji-21.svg": new URL("./twemoji-21.svg", import.meta.url).href
};
register("twemoji", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
