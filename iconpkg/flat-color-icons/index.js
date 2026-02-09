
import { register } from '../core.js';

const lookup = "AAABz4kZAUkYQhrAs6tWWCEnZCW0PCNDZEU0R1aEpSlkiCJVhTZTRGhmRUVWdSNlQkRYR4MBEQEnimy0CQEDAhAnC4YBBwIJAbkCGgMNjgIM+DuTCQMNCBGNAhEqEZwHEQQVDwwGkwMFKIcCIAVRPgcGtQEGFjIBCi4FAlkBSdsV3zRDMttbeJ6STYQH8g4K6w6uDo0ttWKiLBCt0PqGCqhtGwsFHymXwRPePU7JOL87MmcbS/dQW2TsaM/+qdC21PV9XdKwA7smfxG+cGT3rf0DGf1rsqWs208WDKZTqTBgxhbfw5S6XZWvnvwjZ1ZOtBxUVhKcgtLOVyQcfPkAhb6yvZsyPt7tYXQWqQ8Urbt2c1QvJ3oSIT7sbtaT7e1tq9PFwJAe+vS8vDbM8+/t2tAz7kQ3e74s8RrmNrP4muTjvYNHmQs6tIr3h5Ot7fYUL67ZPP00MgqebDwXzvnc6pTAdfnp15VU0bavzwQ9a7rQgR1T4lKCTb3JJhbSEP+Kndk2pTc++jCFS9qfKyMyXfj5gzlkCvhNK3xDB8sYsVSHyKEcAfPFNhiGU6K2yYTR/KT8birH+YJhEo7CRjZ4h1DV43oHtxrPSWIAIAAMACAIAAAAAAACAAAAF2ZsYXQtY29sb3ItaWNvbnMtMDEuc3ZnAAAAF2ZsYXQtY29sb3ItaWNvbnMtMDIuc3Zn/////wAAAAIAAABTBVVBBAFAAEFBBRFQRBAAFAEAARARFERFAVURVEAUEUBQBAEAEAAFQAAREUVEEQFBAUAVQRBAAFBQFVBAAFEFRAEFBEEEBAVVBAQEARFUEAABFAAAAAAA";

const chunks = {
  "flat-color-icons-01.svg": new URL("./flat-color-icons-01.svg", import.meta.url).href,
  "flat-color-icons-02.svg": new URL("./flat-color-icons-02.svg", import.meta.url).href
};

register('flat-color-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
