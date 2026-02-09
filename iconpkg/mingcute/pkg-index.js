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

// iconpkg/mingcute/src-index.ts
var lookup = "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";
var chunks = {
  "mingcute-01.svg": new URL("./mingcute-01.svg", import.meta.url).href,
  "mingcute-02.svg": new URL("./mingcute-02.svg", import.meta.url).href,
  "mingcute-03.svg": new URL("./mingcute-03.svg", import.meta.url).href,
  "mingcute-04.svg": new URL("./mingcute-04.svg", import.meta.url).href,
  "mingcute-05.svg": new URL("./mingcute-05.svg", import.meta.url).href,
  "mingcute-06.svg": new URL("./mingcute-06.svg", import.meta.url).href,
  "mingcute-07.svg": new URL("./mingcute-07.svg", import.meta.url).href,
  "mingcute-08.svg": new URL("./mingcute-08.svg", import.meta.url).href,
  "mingcute-09.svg": new URL("./mingcute-09.svg", import.meta.url).href,
  "mingcute-10.svg": new URL("./mingcute-10.svg", import.meta.url).href,
  "mingcute-11.svg": new URL("./mingcute-11.svg", import.meta.url).href,
  "mingcute-12.svg": new URL("./mingcute-12.svg", import.meta.url).href,
  "mingcute-13.svg": new URL("./mingcute-13.svg", import.meta.url).href,
  "mingcute-14.svg": new URL("./mingcute-14.svg", import.meta.url).href,
  "mingcute-15.svg": new URL("./mingcute-15.svg", import.meta.url).href,
  "mingcute-16.svg": new URL("./mingcute-16.svg", import.meta.url).href,
  "mingcute-17.svg": new URL("./mingcute-17.svg", import.meta.url).href
};
register("mingcute", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
