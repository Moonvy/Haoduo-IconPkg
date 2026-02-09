
import { register } from '../core.js';

const lookup = "AAABMIkY1hgrGnocCKhWF0QjhoRndmNGF1NYdlQ2miRSQ1ZWAVgsjwYKGgYxxwQBbBQCtAF4Ag/CARLBAQEL3AMdelQVBWyqAbgGBCoC2AENQRYCWNaHfu9Qmh79dU2dBgtJkG0h2Sx/iR4nZ6e3qEEjJbIsAuPiU89KbR0p8JKMYa5gTi7OFcsNsFe9vrR18kNye9xSitFaoPjThVamTxtcpxcQlRICofkWBWiHcRscyblve8FRaRAiyrbcXzmbzr08KWjm2iLW/hSdgMPoKhnmXflEJoQKXyBtS/0D/jNSUIdptLApuNAk1461+v8q/ijQEh7yQ77x8npSvzuTNglsYsvXwBTFt9bG2S9QIYMXGzdcHDhg1rD0MPIGtmCVpMIHZ/07HqzEGuEwRiIACCAWBAAAAAACAAAACnVpdy0wMS5zdmcAAAAKdWl3LTAyLnN2Z/////8AAAACAAAANgEBBAAAQAAAAAAAAAAABAAAUBAAAAABAAAAAAAAAAEAAAAAAAABAAAAAAAAAAAAABAAEAQAAAAAAAA=";

const chunks = {
  "uiw-01.svg": new URL("./uiw-01.svg", import.meta.url).href,
  "uiw-02.svg": new URL("./uiw-02.svg", import.meta.url).href
};

register('uiw', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
