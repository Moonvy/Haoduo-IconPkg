
import { register } from '../core.js';

const lookup = "AAACRokZAaIYVBoSTpmEWCo1YkQ2NGVDJXclNTSIRkZURnNiSSSERFNUV1SLR2ZmSDVlVEWEuVMmRSVYWjYDAT0DBhsBHAQEbwcBCeEBtAIRAgoB9gPiCQQdAwMBUw6rBkTPEgEKBAWNAg8RAQoHE2oqDg/LCHzwAQdCDBER8gQRZQoEBQEnBAoDOs8F9SUCFaABDA0kAQJZAaIZxjoMkz43efRZv1TAAQrTrMV6XjPaS6SmMQuaPJPrjgeQFuQRWe/KKGFIb58myPpweNuvYj+4AuzZ+Iv/rxtlI499ekY68mB4h1yLizH1q3dQdW/mJ1ZAbR/qhMiGQMEQpy03xJknvlydxd1JErOuIA53kPd7fMa3/7SbHDh89nV33b/0Z8vcvRBt1mzlW3OqXGlivE/1w5c5+L1Ak9ywp0GjNpiWyuTmdro3+p6MRT4chAH0PBdKpIWm/4dSkvJgnodypFQsx76bc/sjHAd1d4X922ISApnGBu1HSx4PEizfn6+gBSUjQhzcjmHgoSc4xQ41uY8y226Lr+b8MflSfVQpktYJmq0dhm/lkP5bjS24r0cKcug1chtN9wb1/Xhafs582Eu2ApZnsJI/++AkDO0LvViEoe/dz4986HL57MBSrfuRr2tFxZRj8/jEWPVLCgTGQFKAxwj9RCkkY8q9qtu0+UnZ8J0T+FMcZlUGMnBloyn2TBAui2G6nHy7z/LQF4vNLDrn6xF9ZiFscIcKuunKDSOxFAlk7AbW6MTZ8mRWSwCAwAgUAAAAAIAAAAAAAAMAAAALbWFraS0wMS5zdmcAAAALbWFraS0wMi5zdmcAAAALbWFraS0wMy5zdmf/////AAAAAgAAAGlhBQRCFUFQUVBClQVFFVIFFAEVRURAVlUGVABQBRQRABWVBUUQBBVRFFQUQAABQgQBYBRVRaAQVRABQVlUEBQGUQUBBVUUFUBYBWUQARAEFBUAAEQBUVFEQBUAVFREQUEQUAVEEUhFQAgAAAAA";

const chunks = {
  "maki-01.svg": new URL("./maki-01.svg", import.meta.url).href,
  "maki-02.svg": new URL("./maki-02.svg", import.meta.url).href,
  "maki-03.svg": new URL("./maki-03.svg", import.meta.url).href
};

register('maki', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
