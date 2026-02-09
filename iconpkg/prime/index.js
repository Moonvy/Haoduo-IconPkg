
import { register } from '../core.js';

const lookup = "AAABsokZATkYPxqaRXvPWCBFZ1NHRZdmU3dkdTYWMERHQ6OElGNXKVcxZFNkYzM3B1g8EQ+TATUDFEwbBw013RMyZAMCIy8PPQJ/PWQGiQQDMgK+FwyiAwHEFDsfD+MK4QEKBAMQBYYBBAkEEd4BAlkBOb/FQyS21gLfmJw//mzV5CStE7rohjjwCPImWI5poqyvUyzONrtyR44nFN4eePNzGPeAbVgHaXohHidWuB8hub+530FC7VUDgYrPYBY7qYz+E+9pFRs1dgcFbI9frM98r3DsYPL/lRO7EgMBkIAPo2A0fgtV4HYZJr1amEUcjHpzuvpRobAXhZ2VjO/mqWGDsGW3NUTE3Ee2xRgx5kupov4lGw2H06k2gcRCefDmFbnkyd2SEe1brFAlASTwLDEMpwJb8Ay5TTtnBEJP9+bzhPJ0xIKn9L7mfkJzOereEiRrTg7vtx62CoFVrZcAwMSLKkNp0SG2VdCA5KsdyyCnD1HsBnugO1IwHMPOoBfGX7Gm+b5dliAYZBiH2j6+0EY3ndJBvZ/au7PVcSdbLFBpqDatKeHtnmb0bdxIAACANgGhQwEAAAAAAgAAAAxwcmltZS0wMS5zdmcAAAAMcHJpbWUtMDIuc3Zn/////wAAAAIAAABPEEAAQEVQFFAAAEBBQQEBAQEEAARFAABBQQFFQAQEAEAUUQRVUUERBBQEVUAAAAAQBUAAVQFBQAVEAFABEQQUEAQFAEBRFQRAUVQQUBAUAAAAAAA=";

const chunks = {
  "prime-01.svg": new URL("./prime-01.svg", import.meta.url).href,
  "prime-02.svg": new URL("./prime-02.svg", import.meta.url).href
};

register('prime', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
