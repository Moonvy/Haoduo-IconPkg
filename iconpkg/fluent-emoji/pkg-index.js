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

// iconpkg/fluent-emoji/src-index.ts
var lookup = "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";
var chunks = {
  "fluent-emoji-01.svg": new URL("./fluent-emoji-01.svg", import.meta.url).href,
  "fluent-emoji-02.svg": new URL("./fluent-emoji-02.svg", import.meta.url).href,
  "fluent-emoji-03.svg": new URL("./fluent-emoji-03.svg", import.meta.url).href,
  "fluent-emoji-04.svg": new URL("./fluent-emoji-04.svg", import.meta.url).href,
  "fluent-emoji-05.svg": new URL("./fluent-emoji-05.svg", import.meta.url).href,
  "fluent-emoji-06.svg": new URL("./fluent-emoji-06.svg", import.meta.url).href,
  "fluent-emoji-07.svg": new URL("./fluent-emoji-07.svg", import.meta.url).href,
  "fluent-emoji-08.svg": new URL("./fluent-emoji-08.svg", import.meta.url).href,
  "fluent-emoji-09.svg": new URL("./fluent-emoji-09.svg", import.meta.url).href,
  "fluent-emoji-10.svg": new URL("./fluent-emoji-10.svg", import.meta.url).href,
  "fluent-emoji-11.svg": new URL("./fluent-emoji-11.svg", import.meta.url).href,
  "fluent-emoji-12.svg": new URL("./fluent-emoji-12.svg", import.meta.url).href,
  "fluent-emoji-13.svg": new URL("./fluent-emoji-13.svg", import.meta.url).href,
  "fluent-emoji-14.svg": new URL("./fluent-emoji-14.svg", import.meta.url).href,
  "fluent-emoji-15.svg": new URL("./fluent-emoji-15.svg", import.meta.url).href,
  "fluent-emoji-16.svg": new URL("./fluent-emoji-16.svg", import.meta.url).href
};
register("fluent-emoji", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
