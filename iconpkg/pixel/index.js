
import { register } from '../core.js';

const lookup = "AAACbIkZAcIYWhpfo/wNWC10RSMjI1Z2VjcyaSNnM0hyZHJFNkJWJiZkZoZGIysEWGa4OTZaNaNIWCdIZkRYXAFBHAMEAgMoCG1qKgyNAgUBAlZPAgOuAQcB1gsKAo0CAy6EAQgGTwQCUgcXJwIEUiWiAQrFBDsCAZpCAwaYBDE4L1f2FvEcBSq8BAMRCQGAHkAJXyw7AfkFBgIEAlkBwpQvDyziB9pR3LQoTdYTM6yRhGkC+MgUyoFsLL998SbovuETHIDXL+2pa1RN0Ir+8mTPdXv0vGGyIX7Z0zTMqglCAZd3t8ZW2b4+/hercJUPhwdGa8n2bRpHHXKVJk67hs469SeFbNvGnc5Yb2AgwAZfZ/FIBT7mB4xgNiLya39wyQUDtLYBqLV3imWquR1XeqyCu2w3exK49KCDGcwB8q3/z/15v3HLy8NMjwfq1QFf0YsQadatdIy91wFTKgcSrmxlrbMecjHC6Gvqp8vNdt+sExPse+kRVktj9LLtBKbuy5iW2tlKqVU/dL72Xhcd2YIKcst+Kr5/yxRi5Inzhks35Rs2uE50hzUGi9Ys3eJ2zyW1YWFmwYUxPvToZPK+ULlICPS+GKwyaRA11K8hV0QczOxVfrjrGGACwtWUg4A+4rWrv97ECWtnpVpURKh2RG+Y5Ox7kYqNAyB7wHoywCeWRWeccWEpvdEyxt1wbzEZX19m6icXpWMwG4D5kmtb/EELoNWmmH2fP/EWQ49Yuv0KVVlRDz+pccWsxqC7YmG6DNjfMzWpVCVSQ8mCu//fgnAf8hjEpcCP5/AevhjvFf5pgkyAAwAIBCGAIIAAoAAAAAAAAwAAAAxwaXhlbC0wMS5zdmcAAAAMcGl4ZWwtMDIuc3ZnAAAADHBpeGVsLTAzLnN2Z/////8AAAACAAAAcUFREaBEVlBRGEQBVUUFGUFBAZAYVEUYaVEUgWUGVBAQUGVACAAURRJRQVEAUREAGARIBQVBUpEBJRUFAIAmFRFVIQAZhAYkCWBAUARQhUFAVERSiACBAFEYhEUQUYEkFkFVVRRBUQhVaklGUZREYVIBAAAAAA==";

const chunks = {
  "pixel-01.svg": new URL("./pixel-01.svg", import.meta.url).href,
  "pixel-02.svg": new URL("./pixel-02.svg", import.meta.url).href,
  "pixel-03.svg": new URL("./pixel-03.svg", import.meta.url).href
};

register('pixel', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
