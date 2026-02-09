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

// iconpkg/mynaui/src-index.ts
var lookup = "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";
var chunks = {
  "mynaui-01.svg": new URL("./mynaui-01.svg", import.meta.url).href,
  "mynaui-02.svg": new URL("./mynaui-02.svg", import.meta.url).href,
  "mynaui-03.svg": new URL("./mynaui-03.svg", import.meta.url).href,
  "mynaui-04.svg": new URL("./mynaui-04.svg", import.meta.url).href,
  "mynaui-05.svg": new URL("./mynaui-05.svg", import.meta.url).href,
  "mynaui-06.svg": new URL("./mynaui-06.svg", import.meta.url).href,
  "mynaui-07.svg": new URL("./mynaui-07.svg", import.meta.url).href,
  "mynaui-08.svg": new URL("./mynaui-08.svg", import.meta.url).href,
  "mynaui-09.svg": new URL("./mynaui-09.svg", import.meta.url).href,
  "mynaui-10.svg": new URL("./mynaui-10.svg", import.meta.url).href,
  "mynaui-11.svg": new URL("./mynaui-11.svg", import.meta.url).href,
  "mynaui-12.svg": new URL("./mynaui-12.svg", import.meta.url).href,
  "mynaui-13.svg": new URL("./mynaui-13.svg", import.meta.url).href,
  "mynaui-14.svg": new URL("./mynaui-14.svg", import.meta.url).href
};
register("mynaui", {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
export {
  HdIcon
};
