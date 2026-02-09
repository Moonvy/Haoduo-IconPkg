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

// iconpkg/icon-park-outline/src-index.ts
var lookup = "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";
var chunks = {
  "icon-park-outline-01.svg": new URL("./icon-park-outline-01.svg", import.meta.url).href,
  "icon-park-outline-02.svg": new URL("./icon-park-outline-02.svg", import.meta.url).href,
  "icon-park-outline-03.svg": new URL("./icon-park-outline-03.svg", import.meta.url).href,
  "icon-park-outline-04.svg": new URL("./icon-park-outline-04.svg", import.meta.url).href,
  "icon-park-outline-05.svg": new URL("./icon-park-outline-05.svg", import.meta.url).href,
  "icon-park-outline-06.svg": new URL("./icon-park-outline-06.svg", import.meta.url).href,
  "icon-park-outline-07.svg": new URL("./icon-park-outline-07.svg", import.meta.url).href,
  "icon-park-outline-08.svg": new URL("./icon-park-outline-08.svg", import.meta.url).href,
  "icon-park-outline-09.svg": new URL("./icon-park-outline-09.svg", import.meta.url).href,
  "icon-park-outline-10.svg": new URL("./icon-park-outline-10.svg", import.meta.url).href,
  "icon-park-outline-11.svg": new URL("./icon-park-outline-11.svg", import.meta.url).href,
  "icon-park-outline-12.svg": new URL("./icon-park-outline-12.svg", import.meta.url).href,
  "icon-park-outline-13.svg": new URL("./icon-park-outline-13.svg", import.meta.url).href,
  "icon-park-outline-14.svg": new URL("./icon-park-outline-14.svg", import.meta.url).href
};
register("icon-park-outline", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
