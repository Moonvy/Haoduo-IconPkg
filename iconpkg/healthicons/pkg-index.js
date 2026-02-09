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

// iconpkg/healthicons/src-index.ts
var lookup = "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";
var chunks = {
  "healthicons-01.svg": new URL("./healthicons-01.svg", import.meta.url).href,
  "healthicons-02.svg": new URL("./healthicons-02.svg", import.meta.url).href,
  "healthicons-03.svg": new URL("./healthicons-03.svg", import.meta.url).href,
  "healthicons-04.svg": new URL("./healthicons-04.svg", import.meta.url).href,
  "healthicons-05.svg": new URL("./healthicons-05.svg", import.meta.url).href,
  "healthicons-06.svg": new URL("./healthicons-06.svg", import.meta.url).href,
  "healthicons-07.svg": new URL("./healthicons-07.svg", import.meta.url).href,
  "healthicons-08.svg": new URL("./healthicons-08.svg", import.meta.url).href,
  "healthicons-09.svg": new URL("./healthicons-09.svg", import.meta.url).href,
  "healthicons-10.svg": new URL("./healthicons-10.svg", import.meta.url).href,
  "healthicons-11.svg": new URL("./healthicons-11.svg", import.meta.url).href,
  "healthicons-12.svg": new URL("./healthicons-12.svg", import.meta.url).href,
  "healthicons-13.svg": new URL("./healthicons-13.svg", import.meta.url).href,
  "healthicons-14.svg": new URL("./healthicons-14.svg", import.meta.url).href
};
register("healthicons", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
