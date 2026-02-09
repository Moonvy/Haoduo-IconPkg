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
