
import { register } from '../core.js';

const lookup = "AAAAi4kYWxMadb8KgEpDR1alU1dDMxYHUwEKBx4OHNAXBATJAQEEAwIBGTICWFt/rbZGx0I4mW1S7Q++vjdTFoeV2ax3tpzQ0Xb96I3b5nDz3TPcjbdwmhbCPqIRmJWx1lrBDVNZen51ODcH+D2gJI1pOcWbh2wjCaOJ11JCqXVxbdtRk2XWh8uLQwgAAgAAAAABAAAAEGR1by1pY29ucy0wMS5zdmf/////AAAAAQAAAAwAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "duo-icons-01.svg": new URL("./duo-icons-01.svg", import.meta.url).href
};

register('duo-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
