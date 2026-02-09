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

// iconpkg/material-symbols/src-index.ts
var lookup = "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eW1ib2xzLTEzLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTE0LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTE1LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTE2LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTE3LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTE4LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTE5LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTIwLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTIxLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTIyLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTIzLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTI0LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTI1LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTI2LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTI3LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTI4LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTI5LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTMwLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTMxLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTMyLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTMzLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTM0LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTM1LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTM2LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTM3LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTM4LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTM5LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTQwLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTQxLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTQyLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTQzLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTQ0LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTQ1LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTQ2LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTQ3LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTQ4LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTQ5LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTUwLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTUxLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTUyLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTUzLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTU0LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTU1LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTU2LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTU3LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTU4LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTU5LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTYwLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTYxLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTYyLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTYzLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTY0LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTY1LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTY2LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTY3LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTY4LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTY5LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTcwLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTcxLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTcyLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTczLnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTc0LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTc1LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTc2LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTc3LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTc4LnN2ZwAAABdtYXRlcmlhbC1zeW1ib2xzLTc5LnN2ZwAAABdt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";
var chunks = {
  "material-symbols-01.svg": new URL("./material-symbols-01.svg", import.meta.url).href,
  "material-symbols-02.svg": new URL("./material-symbols-02.svg", import.meta.url).href,
  "material-symbols-03.svg": new URL("./material-symbols-03.svg", import.meta.url).href,
  "material-symbols-04.svg": new URL("./material-symbols-04.svg", import.meta.url).href,
  "material-symbols-05.svg": new URL("./material-symbols-05.svg", import.meta.url).href,
  "material-symbols-06.svg": new URL("./material-symbols-06.svg", import.meta.url).href,
  "material-symbols-07.svg": new URL("./material-symbols-07.svg", import.meta.url).href,
  "material-symbols-08.svg": new URL("./material-symbols-08.svg", import.meta.url).href,
  "material-symbols-09.svg": new URL("./material-symbols-09.svg", import.meta.url).href,
  "material-symbols-10.svg": new URL("./material-symbols-10.svg", import.meta.url).href,
  "material-symbols-11.svg": new URL("./material-symbols-11.svg", import.meta.url).href,
  "material-symbols-12.svg": new URL("./material-symbols-12.svg", import.meta.url).href,
  "material-symbols-13.svg": new URL("./material-symbols-13.svg", import.meta.url).href,
  "material-symbols-14.svg": new URL("./material-symbols-14.svg", import.meta.url).href,
  "material-symbols-15.svg": new URL("./material-symbols-15.svg", import.meta.url).href,
  "material-symbols-16.svg": new URL("./material-symbols-16.svg", import.meta.url).href,
  "material-symbols-17.svg": new URL("./material-symbols-17.svg", import.meta.url).href,
  "material-symbols-18.svg": new URL("./material-symbols-18.svg", import.meta.url).href,
  "material-symbols-19.svg": new URL("./material-symbols-19.svg", import.meta.url).href,
  "material-symbols-20.svg": new URL("./material-symbols-20.svg", import.meta.url).href,
  "material-symbols-21.svg": new URL("./material-symbols-21.svg", import.meta.url).href,
  "material-symbols-22.svg": new URL("./material-symbols-22.svg", import.meta.url).href,
  "material-symbols-23.svg": new URL("./material-symbols-23.svg", import.meta.url).href,
  "material-symbols-24.svg": new URL("./material-symbols-24.svg", import.meta.url).href,
  "material-symbols-25.svg": new URL("./material-symbols-25.svg", import.meta.url).href,
  "material-symbols-26.svg": new URL("./material-symbols-26.svg", import.meta.url).href,
  "material-symbols-27.svg": new URL("./material-symbols-27.svg", import.meta.url).href,
  "material-symbols-28.svg": new URL("./material-symbols-28.svg", import.meta.url).href,
  "material-symbols-29.svg": new URL("./material-symbols-29.svg", import.meta.url).href,
  "material-symbols-30.svg": new URL("./material-symbols-30.svg", import.meta.url).href,
  "material-symbols-31.svg": new URL("./material-symbols-31.svg", import.meta.url).href,
  "material-symbols-32.svg": new URL("./material-symbols-32.svg", import.meta.url).href,
  "material-symbols-33.svg": new URL("./material-symbols-33.svg", import.meta.url).href,
  "material-symbols-34.svg": new URL("./material-symbols-34.svg", import.meta.url).href,
  "material-symbols-35.svg": new URL("./material-symbols-35.svg", import.meta.url).href,
  "material-symbols-36.svg": new URL("./material-symbols-36.svg", import.meta.url).href,
  "material-symbols-37.svg": new URL("./material-symbols-37.svg", import.meta.url).href,
  "material-symbols-38.svg": new URL("./material-symbols-38.svg", import.meta.url).href,
  "material-symbols-39.svg": new URL("./material-symbols-39.svg", import.meta.url).href,
  "material-symbols-40.svg": new URL("./material-symbols-40.svg", import.meta.url).href,
  "material-symbols-41.svg": new URL("./material-symbols-41.svg", import.meta.url).href,
  "material-symbols-42.svg": new URL("./material-symbols-42.svg", import.meta.url).href,
  "material-symbols-43.svg": new URL("./material-symbols-43.svg", import.meta.url).href,
  "material-symbols-44.svg": new URL("./material-symbols-44.svg", import.meta.url).href,
  "material-symbols-45.svg": new URL("./material-symbols-45.svg", import.meta.url).href,
  "material-symbols-46.svg": new URL("./material-symbols-46.svg", import.meta.url).href,
  "material-symbols-47.svg": new URL("./material-symbols-47.svg", import.meta.url).href,
  "material-symbols-48.svg": new URL("./material-symbols-48.svg", import.meta.url).href,
  "material-symbols-49.svg": new URL("./material-symbols-49.svg", import.meta.url).href,
  "material-symbols-50.svg": new URL("./material-symbols-50.svg", import.meta.url).href,
  "material-symbols-51.svg": new URL("./material-symbols-51.svg", import.meta.url).href,
  "material-symbols-52.svg": new URL("./material-symbols-52.svg", import.meta.url).href,
  "material-symbols-53.svg": new URL("./material-symbols-53.svg", import.meta.url).href,
  "material-symbols-54.svg": new URL("./material-symbols-54.svg", import.meta.url).href,
  "material-symbols-55.svg": new URL("./material-symbols-55.svg", import.meta.url).href,
  "material-symbols-56.svg": new URL("./material-symbols-56.svg", import.meta.url).href,
  "material-symbols-57.svg": new URL("./material-symbols-57.svg", import.meta.url).href,
  "material-symbols-58.svg": new URL("./material-symbols-58.svg", import.meta.url).href,
  "material-symbols-59.svg": new URL("./material-symbols-59.svg", import.meta.url).href,
  "material-symbols-60.svg": new URL("./material-symbols-60.svg", import.meta.url).href,
  "material-symbols-61.svg": new URL("./material-symbols-61.svg", import.meta.url).href,
  "material-symbols-62.svg": new URL("./material-symbols-62.svg", import.meta.url).href,
  "material-symbols-63.svg": new URL("./material-symbols-63.svg", import.meta.url).href,
  "material-symbols-64.svg": new URL("./material-symbols-64.svg", import.meta.url).href,
  "material-symbols-65.svg": new URL("./material-symbols-65.svg", import.meta.url).href,
  "material-symbols-66.svg": new URL("./material-symbols-66.svg", import.meta.url).href,
  "material-symbols-67.svg": new URL("./material-symbols-67.svg", import.meta.url).href,
  "material-symbols-68.svg": new URL("./material-symbols-68.svg", import.meta.url).href,
  "material-symbols-69.svg": new URL("./material-symbols-69.svg", import.meta.url).href,
  "material-symbols-70.svg": new URL("./material-symbols-70.svg", import.meta.url).href,
  "material-symbols-71.svg": new URL("./material-symbols-71.svg", import.meta.url).href,
  "material-symbols-72.svg": new URL("./material-symbols-72.svg", import.meta.url).href,
  "material-symbols-73.svg": new URL("./material-symbols-73.svg", import.meta.url).href,
  "material-symbols-74.svg": new URL("./material-symbols-74.svg", import.meta.url).href,
  "material-symbols-75.svg": new URL("./material-symbols-75.svg", import.meta.url).href,
  "material-symbols-76.svg": new URL("./material-symbols-76.svg", import.meta.url).href,
  "material-symbols-77.svg": new URL("./material-symbols-77.svg", import.meta.url).href,
  "material-symbols-78.svg": new URL("./material-symbols-78.svg", import.meta.url).href,
  "material-symbols-79.svg": new URL("./material-symbols-79.svg", import.meta.url).href,
  "material-symbols-80.svg": new URL("./material-symbols-80.svg", import.meta.url).href
};
register("material-symbols", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
