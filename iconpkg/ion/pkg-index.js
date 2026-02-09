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

// iconpkg/ion/src-index.ts
var lookup = "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";
var chunks = {
  "ion-01.svg": new URL("./ion-01.svg", import.meta.url).href,
  "ion-02.svg": new URL("./ion-02.svg", import.meta.url).href,
  "ion-03.svg": new URL("./ion-03.svg", import.meta.url).href,
  "ion-04.svg": new URL("./ion-04.svg", import.meta.url).href,
  "ion-05.svg": new URL("./ion-05.svg", import.meta.url).href,
  "ion-06.svg": new URL("./ion-06.svg", import.meta.url).href,
  "ion-07.svg": new URL("./ion-07.svg", import.meta.url).href,
  "ion-08.svg": new URL("./ion-08.svg", import.meta.url).href,
  "ion-09.svg": new URL("./ion-09.svg", import.meta.url).href,
  "ion-10.svg": new URL("./ion-10.svg", import.meta.url).href,
  "ion-11.svg": new URL("./ion-11.svg", import.meta.url).href,
  "ion-12.svg": new URL("./ion-12.svg", import.meta.url).href
};
register("ion", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
