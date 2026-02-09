
import { register } from '../core.js';

const lookup = "AAABIIkYxxgoGtMXFJ1UdUdCREWBZUZUkqNSQyRCaHiVRnRYLhpDKggBAQMFECFXDUNsBgoTAdcHAcIFAQoLAwwEAQ+qAqQB+ASoAS2OCAIPBTgCWMfCgzUHk48+HqKyeuokElT741236CLyzLZUxcVuqYnxPYz+r1SxeIqQ15DrASufX8r32wZUq5Fcqo+tNHplv9uZ7zly4Z2ac8I8ImDtfuguITWLe++rci+mO/y53Jzta9ozlbQ8NuF6PMzuV3HN+k0+eDs3utAuMO3BSBahcgt4UyrzYEIX6lQYVM1Mt6Lnbvho/TCTE1K2G8hLPCGiYcl7joyifCfZNOFx9ZkBv+nfgvcfKs34ynu6XvdiEF8PqIAxR7iMUAbvRQAEAAAAAAAAAAEAAAAKY2lmLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "cif-01.svg": new URL("./cif-01.svg", import.meta.url).href
};

register('cif', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
