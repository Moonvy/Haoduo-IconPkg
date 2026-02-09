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

// iconpkg/carbon/src-index.ts
var lookup = "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";
var chunks = {
  "carbon-01.svg": new URL("./carbon-01.svg", import.meta.url).href,
  "carbon-02.svg": new URL("./carbon-02.svg", import.meta.url).href,
  "carbon-03.svg": new URL("./carbon-03.svg", import.meta.url).href,
  "carbon-04.svg": new URL("./carbon-04.svg", import.meta.url).href,
  "carbon-05.svg": new URL("./carbon-05.svg", import.meta.url).href,
  "carbon-06.svg": new URL("./carbon-06.svg", import.meta.url).href,
  "carbon-07.svg": new URL("./carbon-07.svg", import.meta.url).href,
  "carbon-08.svg": new URL("./carbon-08.svg", import.meta.url).href,
  "carbon-09.svg": new URL("./carbon-09.svg", import.meta.url).href,
  "carbon-10.svg": new URL("./carbon-10.svg", import.meta.url).href,
  "carbon-11.svg": new URL("./carbon-11.svg", import.meta.url).href,
  "carbon-12.svg": new URL("./carbon-12.svg", import.meta.url).href,
  "carbon-13.svg": new URL("./carbon-13.svg", import.meta.url).href
};
register("carbon", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
