
import { register } from '../core.js';

const lookup = "AAAAUIkYLgoaFIB+ZEWURVNFNEsQ2QQJBwIkCAYRAgJYLsUjgG7y5t7Zy+Ink/VIXrwMD/OKj14KrCsNzo1GOU2Fbkto4upaq8n7BEjumVZCAAAAAAAAAQAAABNzdmctc3Bpbm5lcnMtMDEuc3Zn/////wAAAAEAAAAGAAAAAAAAAAAAAA==";

const chunks = {
  "svg-spinners-01.svg": new URL("./svg-spinners-01.svg", import.meta.url).href
};

register('svg-spinners', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
