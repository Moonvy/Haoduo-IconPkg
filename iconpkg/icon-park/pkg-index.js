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

// iconpkg/icon-park/src-index.ts
var lookup = "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";
var chunks = {
  "icon-park-01.svg": new URL("./icon-park-01.svg", import.meta.url).href,
  "icon-park-02.svg": new URL("./icon-park-02.svg", import.meta.url).href,
  "icon-park-03.svg": new URL("./icon-park-03.svg", import.meta.url).href,
  "icon-park-04.svg": new URL("./icon-park-04.svg", import.meta.url).href,
  "icon-park-05.svg": new URL("./icon-park-05.svg", import.meta.url).href,
  "icon-park-06.svg": new URL("./icon-park-06.svg", import.meta.url).href,
  "icon-park-07.svg": new URL("./icon-park-07.svg", import.meta.url).href,
  "icon-park-08.svg": new URL("./icon-park-08.svg", import.meta.url).href,
  "icon-park-09.svg": new URL("./icon-park-09.svg", import.meta.url).href,
  "icon-park-10.svg": new URL("./icon-park-10.svg", import.meta.url).href,
  "icon-park-11.svg": new URL("./icon-park-11.svg", import.meta.url).href,
  "icon-park-12.svg": new URL("./icon-park-12.svg", import.meta.url).href,
  "icon-park-13.svg": new URL("./icon-park-13.svg", import.meta.url).href,
  "icon-park-14.svg": new URL("./icon-park-14.svg", import.meta.url).href
};
register("icon-park", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
