
import { register } from '../core.js';

const lookup = "AAAAb4kYRg4a8xla9Uc3ZmgyVydEUPwCAgRhM3oBAhkFvAECBgECWEZg6bdZvW0i80g1v+o/lfKqQOP1lbnFdGymUgceRCxfOl83B3OCMM/oqRu68sdsGLiHqB6Ms0Wsfh2gFRt8doz39JKfaBkUQgAAAAAAAAEAAAAJZWktMDEuc3Zn/////wAAAAEAAAAJAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "ei-01.svg": new URL("./ei-01.svg", import.meta.url).href
};

register('ei', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
