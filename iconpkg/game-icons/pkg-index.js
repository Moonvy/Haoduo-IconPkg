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

// iconpkg/game-icons/src-index.ts
var lookup = "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";
var chunks = {
  "game-icons-01.svg": new URL("./game-icons-01.svg", import.meta.url).href,
  "game-icons-02.svg": new URL("./game-icons-02.svg", import.meta.url).href,
  "game-icons-03.svg": new URL("./game-icons-03.svg", import.meta.url).href,
  "game-icons-04.svg": new URL("./game-icons-04.svg", import.meta.url).href,
  "game-icons-05.svg": new URL("./game-icons-05.svg", import.meta.url).href,
  "game-icons-06.svg": new URL("./game-icons-06.svg", import.meta.url).href,
  "game-icons-07.svg": new URL("./game-icons-07.svg", import.meta.url).href,
  "game-icons-08.svg": new URL("./game-icons-08.svg", import.meta.url).href,
  "game-icons-09.svg": new URL("./game-icons-09.svg", import.meta.url).href,
  "game-icons-10.svg": new URL("./game-icons-10.svg", import.meta.url).href,
  "game-icons-11.svg": new URL("./game-icons-11.svg", import.meta.url).href,
  "game-icons-12.svg": new URL("./game-icons-12.svg", import.meta.url).href,
  "game-icons-13.svg": new URL("./game-icons-13.svg", import.meta.url).href,
  "game-icons-14.svg": new URL("./game-icons-14.svg", import.meta.url).href,
  "game-icons-15.svg": new URL("./game-icons-15.svg", import.meta.url).href,
  "game-icons-16.svg": new URL("./game-icons-16.svg", import.meta.url).href,
  "game-icons-17.svg": new URL("./game-icons-17.svg", import.meta.url).href,
  "game-icons-18.svg": new URL("./game-icons-18.svg", import.meta.url).href,
  "game-icons-19.svg": new URL("./game-icons-19.svg", import.meta.url).href,
  "game-icons-20.svg": new URL("./game-icons-20.svg", import.meta.url).href,
  "game-icons-21.svg": new URL("./game-icons-21.svg", import.meta.url).href
};
register("game-icons", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
