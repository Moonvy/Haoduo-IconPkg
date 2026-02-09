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
