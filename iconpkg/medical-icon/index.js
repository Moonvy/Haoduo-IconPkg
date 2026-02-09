
import { register } from '../core.js';

const lookup = "AAAA1IkYkBgdGsfgf5ZPV3ZEI0d4ckMzcnOFNFYIWB+zAwQKawMFAQyVBcMCAigKBgMFugMEFzi5AhsJNhlRAliQxjvSYXllXmNrhvCxazlZ2nEGcaFiRVS3fsGG2Ajyiv4wF7sEl5UO4LMi5IpqsQtGRplfhp8C4QZ9JoyvRd/OSS7TJ9dyl8vLe7UhbsAGPSxHSPpD4WMyIGP7ZaUuXKaM+/yu+W8G0iJQEmj/D1PU/eItWzqwyiAf1dCP9ZDkgy2NXeVk6jMhv58oOJFXbjcQRMAABAAAAAAAAQAAABNtZWRpY2FsLWljb24tMDEuc3Zn/////wAAAAEAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "medical-icon-01.svg": new URL("./medical-icon-01.svg", import.meta.url).href
};

register('medical-icon', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
