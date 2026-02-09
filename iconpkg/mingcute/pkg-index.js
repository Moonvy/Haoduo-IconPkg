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
