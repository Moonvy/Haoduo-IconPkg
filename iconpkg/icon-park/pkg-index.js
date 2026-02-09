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
