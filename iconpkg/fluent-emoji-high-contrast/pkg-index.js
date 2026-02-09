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

// iconpkg/fluent-emoji-high-contrast/src-index.ts
var lookup = "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";
var chunks = {
  "fluent-emoji-high-contrast-01.svg": new URL("./fluent-emoji-high-contrast-01.svg", import.meta.url).href,
  "fluent-emoji-high-contrast-02.svg": new URL("./fluent-emoji-high-contrast-02.svg", import.meta.url).href,
  "fluent-emoji-high-contrast-03.svg": new URL("./fluent-emoji-high-contrast-03.svg", import.meta.url).href,
  "fluent-emoji-high-contrast-04.svg": new URL("./fluent-emoji-high-contrast-04.svg", import.meta.url).href,
  "fluent-emoji-high-contrast-05.svg": new URL("./fluent-emoji-high-contrast-05.svg", import.meta.url).href,
  "fluent-emoji-high-contrast-06.svg": new URL("./fluent-emoji-high-contrast-06.svg", import.meta.url).href,
  "fluent-emoji-high-contrast-07.svg": new URL("./fluent-emoji-high-contrast-07.svg", import.meta.url).href,
  "fluent-emoji-high-contrast-08.svg": new URL("./fluent-emoji-high-contrast-08.svg", import.meta.url).href
};
register("fluent-emoji-high-contrast", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
