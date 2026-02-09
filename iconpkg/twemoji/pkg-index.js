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
