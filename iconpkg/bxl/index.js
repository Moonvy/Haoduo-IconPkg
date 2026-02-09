
import { register } from '../core.js';

const lookup = "AAAA3YkYmxgfGscuE4VQMhVGhicnJTM3Vni1RWZVBlgcARQ3CAcdO1I9BEsCMQmLAT8FzkUFjAEeBhGFAQJYm6HTasNny9ZgtngTuY5vU0F9iLL6f2D3lLKMyw4FPIPsz601eFHYxtACZzCiDa/28ktpAd5xgX67ySk6srA58s3AcfImUqYAUHCnIXa3Krdwm2XYSFe4XFGwY3SslF6ItKlIHoJCTl+nR8rJ0NC9shnGxl0qL44qDw79VBJco64MwvBCr98QyHa1EjzLLEZHnSRD76KhuVyD5nGPRApqAAEAAAAAAQAAAApieGwtMDEuc3Zn/////wAAAAEAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "bxl-01.svg": new URL("./bxl-01.svg", import.meta.url).href
};

register('bxl', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
