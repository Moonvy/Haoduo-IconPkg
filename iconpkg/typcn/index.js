
import { register } from '../core.js';

const lookup = "AAAB2IkZAVAYRBqHp6BpWCJ0NGRUKCJlgVhIhnOFRydUZChjM2eWRGN0Q1RCVkaWJEkkWEgH0QMEGAUaD9ICBxKeAfoDTsgDAgeCAwGrAQPEA2AHTQEgBBKlEQQMVwIEPhgHvgkCuAEDVAIPJS0BB4YBFAUFygEC8AQHAgICWQFQlBCcD60/Ylsokjt2CoXVuftfsLkevvua7pQ6UHy3c0fXQBRoULz00t8SE6zFlrUp/gkiJzbN5stBO5tSCkVYs3fl5CFpRrr7T6zgbE75leHtJx/aNc1ShHsnn809BjfjkVuV7Ee8azRgGBqnoG/2+XEZqgG6Mcjne+fO12fYO//iZGwzRufnh0d+ssrMrnQrLFhpvw6voqh+c8yuRvmLyJoRayFrnP2JGFSnERx6TGNA2CGIpWAosGEgLW3z8WOp7Sk+9HKBG/1tlgcSoziRIc9Kud+Mnfd5jb4NAzpvuZAfhyGfN3tGc76OrtHktkSSpPg8HdnRjR/mwxx1ipxV+i/KhzYeuVPEVUVzF+D012itux4/ubMHvo5jpsjyAnXEebcHfaiIm7mh/6upxhedEk2kAjaIlH8cwNhEwdBKbcEQAAzIpRR0DpAQ/L/W7BVPSQhOAAACUACEAAAAAAACAAAADHR5cGNuLTAxLnN2ZwAAAAx0eXBjbi0wMi5zdmf/////AAAAAgAAAFQAQQURQUEUEEQQRBQEBUEEFBAARQBQEAEFUEQUERQQBQEUVEEAAVVQQEABQVAEABBAEUBVAEQQRQBBEAERAUVVBQQFEAQQAVAVFARQFAEUBARVQFAAAAAA";

const chunks = {
  "typcn-01.svg": new URL("./typcn-01.svg", import.meta.url).href,
  "typcn-02.svg": new URL("./typcn-02.svg", import.meta.url).href
};

register('typcn', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
