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

// iconpkg/icon-park-twotone/src-index.ts
var lookup = "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";
var chunks = {
  "icon-park-twotone-01.svg": new URL("./icon-park-twotone-01.svg", import.meta.url).href,
  "icon-park-twotone-02.svg": new URL("./icon-park-twotone-02.svg", import.meta.url).href,
  "icon-park-twotone-03.svg": new URL("./icon-park-twotone-03.svg", import.meta.url).href,
  "icon-park-twotone-04.svg": new URL("./icon-park-twotone-04.svg", import.meta.url).href,
  "icon-park-twotone-05.svg": new URL("./icon-park-twotone-05.svg", import.meta.url).href,
  "icon-park-twotone-06.svg": new URL("./icon-park-twotone-06.svg", import.meta.url).href,
  "icon-park-twotone-07.svg": new URL("./icon-park-twotone-07.svg", import.meta.url).href,
  "icon-park-twotone-08.svg": new URL("./icon-park-twotone-08.svg", import.meta.url).href,
  "icon-park-twotone-09.svg": new URL("./icon-park-twotone-09.svg", import.meta.url).href,
  "icon-park-twotone-10.svg": new URL("./icon-park-twotone-10.svg", import.meta.url).href
};
register("icon-park-twotone", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
