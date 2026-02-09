
import { register } from '../core.js';

const lookup = "AAABaIkY/RgzGlqLkTRYGmeEeEelU0JTWjVJBUNXY2VFVEgkViV0Y2MCWDcjDCTIAaABfuMBAinGDQocBAECB4QGHwHICwYLAwe0AgRvCwoGAgkRagQFASAtSwERogEHFAMtAlj9+14SV7Ll9kiD/0lawmGLne+pe3urBEF7qNL9IoJ2uZqE1wwpWqdiL7ABK9ifOPuDzB+VBX8YUNHsAKKj9HUoKz7tOgYht71PzuBO8x+zmSHvt9fmhia6gyjslPACivXesjejod9WvIpmbKhc3qB3V59w+qSwwBIyrTVUjuH8U/VQJE3Jm3Be5VZGqkPCqjMyMLnXGvdJIXZf+n8kIo+k3fRAub+3be3ecxNZ2Jaki1ZeeRU75Kmn9TVHFByO+Nq1N5vjF1WsYs7Fhuk7HvTAxiRUMF5S+wmmnNtDLnc8Lj3+KjYTnHP9pSdRnwrgEySR/3e6n4QXzUyFdw5L/EcAAIgIAAAEAAAAAAIAAAAQZW9zLWljb25zLTAxLnN2ZwAAABBlb3MtaWNvbnMtMDIuc3Zn/////wAAAAIAAABAEBAAABFAAQBAEAEAEBBBAAAAAAEAQEAAAQABRABQAAEQEAFABAAFABQAAUQARAAAAAEQAQBEAEFAUREABQAQAAAAAAA=";

const chunks = {
  "eos-icons-01.svg": new URL("./eos-icons-01.svg", import.meta.url).href,
  "eos-icons-02.svg": new URL("./eos-icons-02.svg", import.meta.url).href
};

register('eos-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
