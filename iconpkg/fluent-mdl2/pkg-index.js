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

// iconpkg/fluent-mdl2/src-index.ts
var lookup = "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";
var chunks = {
  "fluent-mdl2-01.svg": new URL("./fluent-mdl2-01.svg", import.meta.url).href,
  "fluent-mdl2-02.svg": new URL("./fluent-mdl2-02.svg", import.meta.url).href,
  "fluent-mdl2-03.svg": new URL("./fluent-mdl2-03.svg", import.meta.url).href,
  "fluent-mdl2-04.svg": new URL("./fluent-mdl2-04.svg", import.meta.url).href,
  "fluent-mdl2-05.svg": new URL("./fluent-mdl2-05.svg", import.meta.url).href,
  "fluent-mdl2-06.svg": new URL("./fluent-mdl2-06.svg", import.meta.url).href,
  "fluent-mdl2-07.svg": new URL("./fluent-mdl2-07.svg", import.meta.url).href,
  "fluent-mdl2-08.svg": new URL("./fluent-mdl2-08.svg", import.meta.url).href,
  "fluent-mdl2-09.svg": new URL("./fluent-mdl2-09.svg", import.meta.url).href
};
register("fluent-mdl2", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
