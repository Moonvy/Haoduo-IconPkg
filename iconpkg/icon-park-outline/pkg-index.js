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
