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

// iconpkg/material-symbols-light/src-index.ts
var lookup = "AABQhokZPEkZDA8aH4IbTlkGCDU4RlZIR1OIh0YmVlVERUU2NDQ3NYlyNyRFOFRzVng5QlVWVjU2NnaoOXUUNHZEVURDRnczh0ZGQVhZZzM1oZV1d2h0ZJRmRHREdDiUNYVENHJ3RmVidDiqmVQ0NnUXIzIilkhnZEQ1FSBYeCZqc1WERTZEZVZFZIVFN0JiY1NnVFWAQ1Q3OFdYR4J0aTWFZVNxJGiSIhYGhHNlQiJURjBUozNiZHBqNSg2RmZnISlFZkQjciWJRjhJNjcgdDhyRmhjZ3N2YSZUUxhVSVd4FFNWRih3NiZVNldYYmgkcjZFaIKIikNmVUjCeHRjW4Q3J0N0M0JGQ2VpdoU0RjhkNMU2ZlNEIzRGZiJEQ3M3ZWYpdDQ0QzdoUUc1RRRVU0godCWnZTYjZIZlZDI0UmKCZFh1R0t0BXRDRzcyZWVKRoKJgzllFkkkdZRTNVKEq1MkdWZUI1ZVSFU3UkeChUZoREJGYiOUY0VkRSMSJXdDlERkhhZFc4QXJTeEJbZVQlRIcGKXM1JRNFOmZGF4VTdCdVaFc4VHVjhjRUWHNGZUe1hHVTlkZWklFURFhGFnJEVBNjZDc6OiiDFTlyOERTaEUaiDVWYld0MzZkJhh0yDM2pXVzZ1MxQRMnaihURUhZZRSUZULFdmUmgyIURFEpRXMlUnOTSBJ1OlRqJHY1ZieEVmQ0REIqdGUliIpDVGVWl6UkVEOGZCdFWEVMY0YyUyEZMTJXI2aYk4KUd1RmgnRVNFEziGR0RXR3SEpHM1ZVV4ZUU3ZCY8ZodXNJQlVHY5VlKjKEhkdDVHJVZEdUF0BKUjllVXJaMzczN4NjZiZoU0hmLDp0WIV4VXd1cGNGJiN2aGV3ZTZIRWJjhiE2OkZIU1diJVNXVHdERmOFczZ3M3BnQ4JUVzM3QxR2NRYsMXUyV3GlNjV0NFV4ZXlkUYRYGCcCQ1QlZ1M1J2Q5ZiJUVmEmWEqzZHWnRkVHNTVTdWUiM6RJdThVQ0VHZjVEQ0hkVjenY0N3iJaCWxUzVDR3SVaWZCNTRmd0a2RTZoJkg1VWVHUlQ6N7FzVWYWRnNiJVRLhSIzRFJiRlZLI0hoZjREmWQVI2VDBEJShTiWRXeYdWGFJ3ZYY0dEUidCRVdDRmWGIkQ2ZHNnJGIyZYRxNjMrZCNiglZFM2RmSGiGZJR2aCVJ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LXN5bWJvbHMtbGlnaHQtMDMuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMDQuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMDUuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMDYuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMDcuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMDguc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMDkuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMTAuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMTEuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMTIuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMTMuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMTQuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMTUuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMTYuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMTcuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMTguc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMTkuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMjAuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMjEuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMjIuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMjMuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMjQuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMjUuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMjYuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMjcuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMjguc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMjkuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMzAuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMzEuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMzIuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMzMuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMzQuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMzUuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMzYuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMzcuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMzguc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtMzkuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNDAuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNDEuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNDIuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNDMuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNDQuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNDUuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNDYuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNDcuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNDguc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNDkuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNTAuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNTEuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNTIuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNTMuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNTQuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNTUuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNTYuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNTcuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNTguc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNTkuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNjAuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNjEuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNjIuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNjMuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNjQuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNjUuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNjYuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNjcuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNjguc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNjkuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNzAuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNzEuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNzIuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNzMuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNzQuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNzUuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNzYuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNzcuc3ZnAAAAHW1hdGVyaWFsLXN5bWJvbHMtbGlnaHQtNzguc3Zn/////wAAAAcAADTAQZYSUbQEWBaD48VpESuLloRhQplGAYxG4Al2BgWP6tCAIHDDXwFAeO0whJojNZulSIKjCLKgGUO/x+Ezc8mMPdsEZAAmST3UjIAJChIxAKxpqDlct8OPZrMRjKmD4uTTLDvCZSNlSnxiPVChs2odfyojsMcjKnLJnSzD9CQgGxTpYRIdYC2PxBV5sQSzIPB3atAeolbmlZshVsjNK3nK0V66ItPHPFGCCpZpVEnqDisegdIqnowRQyhg8oEqy8xx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";
var chunks = {
  "material-symbols-light-01.svg": new URL("./material-symbols-light-01.svg", import.meta.url).href,
  "material-symbols-light-02.svg": new URL("./material-symbols-light-02.svg", import.meta.url).href,
  "material-symbols-light-03.svg": new URL("./material-symbols-light-03.svg", import.meta.url).href,
  "material-symbols-light-04.svg": new URL("./material-symbols-light-04.svg", import.meta.url).href,
  "material-symbols-light-05.svg": new URL("./material-symbols-light-05.svg", import.meta.url).href,
  "material-symbols-light-06.svg": new URL("./material-symbols-light-06.svg", import.meta.url).href,
  "material-symbols-light-07.svg": new URL("./material-symbols-light-07.svg", import.meta.url).href,
  "material-symbols-light-08.svg": new URL("./material-symbols-light-08.svg", import.meta.url).href,
  "material-symbols-light-09.svg": new URL("./material-symbols-light-09.svg", import.meta.url).href,
  "material-symbols-light-10.svg": new URL("./material-symbols-light-10.svg", import.meta.url).href,
  "material-symbols-light-11.svg": new URL("./material-symbols-light-11.svg", import.meta.url).href,
  "material-symbols-light-12.svg": new URL("./material-symbols-light-12.svg", import.meta.url).href,
  "material-symbols-light-13.svg": new URL("./material-symbols-light-13.svg", import.meta.url).href,
  "material-symbols-light-14.svg": new URL("./material-symbols-light-14.svg", import.meta.url).href,
  "material-symbols-light-15.svg": new URL("./material-symbols-light-15.svg", import.meta.url).href,
  "material-symbols-light-16.svg": new URL("./material-symbols-light-16.svg", import.meta.url).href,
  "material-symbols-light-17.svg": new URL("./material-symbols-light-17.svg", import.meta.url).href,
  "material-symbols-light-18.svg": new URL("./material-symbols-light-18.svg", import.meta.url).href,
  "material-symbols-light-19.svg": new URL("./material-symbols-light-19.svg", import.meta.url).href,
  "material-symbols-light-20.svg": new URL("./material-symbols-light-20.svg", import.meta.url).href,
  "material-symbols-light-21.svg": new URL("./material-symbols-light-21.svg", import.meta.url).href,
  "material-symbols-light-22.svg": new URL("./material-symbols-light-22.svg", import.meta.url).href,
  "material-symbols-light-23.svg": new URL("./material-symbols-light-23.svg", import.meta.url).href,
  "material-symbols-light-24.svg": new URL("./material-symbols-light-24.svg", import.meta.url).href,
  "material-symbols-light-25.svg": new URL("./material-symbols-light-25.svg", import.meta.url).href,
  "material-symbols-light-26.svg": new URL("./material-symbols-light-26.svg", import.meta.url).href,
  "material-symbols-light-27.svg": new URL("./material-symbols-light-27.svg", import.meta.url).href,
  "material-symbols-light-28.svg": new URL("./material-symbols-light-28.svg", import.meta.url).href,
  "material-symbols-light-29.svg": new URL("./material-symbols-light-29.svg", import.meta.url).href,
  "material-symbols-light-30.svg": new URL("./material-symbols-light-30.svg", import.meta.url).href,
  "material-symbols-light-31.svg": new URL("./material-symbols-light-31.svg", import.meta.url).href,
  "material-symbols-light-32.svg": new URL("./material-symbols-light-32.svg", import.meta.url).href,
  "material-symbols-light-33.svg": new URL("./material-symbols-light-33.svg", import.meta.url).href,
  "material-symbols-light-34.svg": new URL("./material-symbols-light-34.svg", import.meta.url).href,
  "material-symbols-light-35.svg": new URL("./material-symbols-light-35.svg", import.meta.url).href,
  "material-symbols-light-36.svg": new URL("./material-symbols-light-36.svg", import.meta.url).href,
  "material-symbols-light-37.svg": new URL("./material-symbols-light-37.svg", import.meta.url).href,
  "material-symbols-light-38.svg": new URL("./material-symbols-light-38.svg", import.meta.url).href,
  "material-symbols-light-39.svg": new URL("./material-symbols-light-39.svg", import.meta.url).href,
  "material-symbols-light-40.svg": new URL("./material-symbols-light-40.svg", import.meta.url).href,
  "material-symbols-light-41.svg": new URL("./material-symbols-light-41.svg", import.meta.url).href,
  "material-symbols-light-42.svg": new URL("./material-symbols-light-42.svg", import.meta.url).href,
  "material-symbols-light-43.svg": new URL("./material-symbols-light-43.svg", import.meta.url).href,
  "material-symbols-light-44.svg": new URL("./material-symbols-light-44.svg", import.meta.url).href,
  "material-symbols-light-45.svg": new URL("./material-symbols-light-45.svg", import.meta.url).href,
  "material-symbols-light-46.svg": new URL("./material-symbols-light-46.svg", import.meta.url).href,
  "material-symbols-light-47.svg": new URL("./material-symbols-light-47.svg", import.meta.url).href,
  "material-symbols-light-48.svg": new URL("./material-symbols-light-48.svg", import.meta.url).href,
  "material-symbols-light-49.svg": new URL("./material-symbols-light-49.svg", import.meta.url).href,
  "material-symbols-light-50.svg": new URL("./material-symbols-light-50.svg", import.meta.url).href,
  "material-symbols-light-51.svg": new URL("./material-symbols-light-51.svg", import.meta.url).href,
  "material-symbols-light-52.svg": new URL("./material-symbols-light-52.svg", import.meta.url).href,
  "material-symbols-light-53.svg": new URL("./material-symbols-light-53.svg", import.meta.url).href,
  "material-symbols-light-54.svg": new URL("./material-symbols-light-54.svg", import.meta.url).href,
  "material-symbols-light-55.svg": new URL("./material-symbols-light-55.svg", import.meta.url).href,
  "material-symbols-light-56.svg": new URL("./material-symbols-light-56.svg", import.meta.url).href,
  "material-symbols-light-57.svg": new URL("./material-symbols-light-57.svg", import.meta.url).href,
  "material-symbols-light-58.svg": new URL("./material-symbols-light-58.svg", import.meta.url).href,
  "material-symbols-light-59.svg": new URL("./material-symbols-light-59.svg", import.meta.url).href,
  "material-symbols-light-60.svg": new URL("./material-symbols-light-60.svg", import.meta.url).href,
  "material-symbols-light-61.svg": new URL("./material-symbols-light-61.svg", import.meta.url).href,
  "material-symbols-light-62.svg": new URL("./material-symbols-light-62.svg", import.meta.url).href,
  "material-symbols-light-63.svg": new URL("./material-symbols-light-63.svg", import.meta.url).href,
  "material-symbols-light-64.svg": new URL("./material-symbols-light-64.svg", import.meta.url).href,
  "material-symbols-light-65.svg": new URL("./material-symbols-light-65.svg", import.meta.url).href,
  "material-symbols-light-66.svg": new URL("./material-symbols-light-66.svg", import.meta.url).href,
  "material-symbols-light-67.svg": new URL("./material-symbols-light-67.svg", import.meta.url).href,
  "material-symbols-light-68.svg": new URL("./material-symbols-light-68.svg", import.meta.url).href,
  "material-symbols-light-69.svg": new URL("./material-symbols-light-69.svg", import.meta.url).href,
  "material-symbols-light-70.svg": new URL("./material-symbols-light-70.svg", import.meta.url).href,
  "material-symbols-light-71.svg": new URL("./material-symbols-light-71.svg", import.meta.url).href,
  "material-symbols-light-72.svg": new URL("./material-symbols-light-72.svg", import.meta.url).href,
  "material-symbols-light-73.svg": new URL("./material-symbols-light-73.svg", import.meta.url).href,
  "material-symbols-light-74.svg": new URL("./material-symbols-light-74.svg", import.meta.url).href,
  "material-symbols-light-75.svg": new URL("./material-symbols-light-75.svg", import.meta.url).href,
  "material-symbols-light-76.svg": new URL("./material-symbols-light-76.svg", import.meta.url).href,
  "material-symbols-light-77.svg": new URL("./material-symbols-light-77.svg", import.meta.url).href,
  "material-symbols-light-78.svg": new URL("./material-symbols-light-78.svg", import.meta.url).href
};
register("material-symbols-light", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
