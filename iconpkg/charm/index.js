
import { register } from '../core.js';

const lookup = "AAABc4kZAQYYNRomKBZxWBtohER4cjdUZxV1RVgURjOGdDMyJnQ1U6hhZAVYNv0CAgH6AgTZExYuJwoBfDpSAwsLB6sBDhQzCAgEQdYCEuwBBgEDBCIEAlUcAgULOu0aCAsyCQJZAQYXFR2WhZLWVSy+D0ihaKN2viJJAzUks3a1YIEPTKVwRnr3rRwKf7/eYPapMGy4wYCYPm5d1qMWD3e9aw356wKFulML/fcav/ysIjBQeqvKJrbS4ww7ey11YBKipFcMTnvjj8sVdebKTMEeAb51v6ck0W0mNqXXMvPlKsLtbNWpEWipFOJ7ups5uUcdHH8gLFMlVrRQ3B+WP+QR/ict7SnPn0Cp6yzzO1XDoxmFAonRla8HOByD6qB0uzh+36/QcZAsv6gbl0g+cxZKTeyy8X2VPKPet51pawrl5NAHsLM/MpxKUVVpR6/uZwaUcuRsjDDyTiLA1R0hpm4+X70Mu5gq1XqdIa2zRxABEgIAAAEAAAAAAgAAAAxjaGFybS0wMS5zdmcAAAAMY2hhcm0tMDIuc3Zn/////wAAAAIAAABCVAFAEQQABQQUBBAAQABEQFBAAAQAQAEAAQAAABAAFBBEBAAQAAABAQUEFRAEAVBAEAQAEQEBRAQAAAEAAEBAABAEAAAAAA==";

const chunks = {
  "charm-01.svg": new URL("./charm-01.svg", import.meta.url).href,
  "charm-02.svg": new URL("./charm-02.svg", import.meta.url).href
};

register('charm', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
