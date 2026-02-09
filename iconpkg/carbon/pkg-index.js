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
