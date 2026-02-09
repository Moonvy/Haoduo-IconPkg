
import { register } from '../core.js';

const lookup = "AAAAVIkYMwsaE3mu2kZEMlaWRARJBQqxAQ4LEgIHAlgz3sreoHppbQGCOFiS3wk6vSphvnSAtLL4CkSmg/OrvP35P+zXlZb5JiMbJK7COmG0S0BTQgUBAAAAAAEAAAALZ2FsYS0wMS5zdmf/////AAAAAQAAAAcAAAAAAAAAAAAAAA==";

const chunks = {
  "gala-01.svg": new URL("./gala-01.svg", import.meta.url).href
};

register('gala', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
