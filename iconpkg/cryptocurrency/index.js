
import { register } from '../core.js';

const lookup = "AAACnIkZAeMYYRqOHOfmWDFKV1NEKWQ0imZFOGhSNWZjU1dybERGmCRlhlIlFlNHJTMzJ5RSZFRGNXGEJEhzVXYEWGagGhYHDwYDDVcNEx4Bqx/nBhg3BgGrAwGhBC8BDAIQGQTEAQIFHCIB7AGaMRUBEA8J9AO+BAQCBFFUeQETAWsCCAIUDQIBARQBkAEO2gFdCDEISggaOAnWAQUB+QIJAxUTDALrAwQCWQHjD9iqpQZCZogO8Bbvoi/CatsP4gU2CJrGPs/FL+NJSKy5MQOyH+LGv/dkEnJZ7HiTkKhHxwe8TZWrBwyzNsKPFj/wdYECae9HV6xNfYUV5DFM2zD/WPfYesu7/DcjHuIOoWopw4Xm1otZKH/uAQUSv65avGcMEcnhCzER2T2fBsvIGZ0QkUqwf37KCIPrGSrPtzVF4UcjWBGt8mSnnVm2F2P4G6Q0xYgisKkb+wvpUSOrwsC3RJnGeujKZHb8OLARydMY5P3w0nGWVB9dWkcgXV5w8XMyhQ6BcsGN+eljlJAPAgmofI9EiG0NrnScSzzrto6dwDOGackXGs5y6RMydLmcWxa+47FDHazUqGCp4Tw+jbpLh89ek4SPLm+f9NchAfJtne8pPNEK7H0yaG17Geh79hDgLVoMgZ8xZxKDbZQubJOFT76czeHKbAcU/vMwC0aBCa0NYeoq2l/zRapdkOYkPMEYVSlERkHfGIcLkd038jVb7O4br2gp/ozqhSmrZ5cyn/D3bOZtcdMQVU4HOJVavxPsLbjfofo6qzRXsmShWKdjlghTlIVpfCKTzG7eYeiiLE2ezMwk3VcUnOHBM7xph4k69qdDmng/+0iQIKMlztVQdMbvJ8S4MeAC13GuyZTrTRACAAQAABACICEGAAAAAAAAAwAAABVjcnlwdG9jdXJyZW5jeS0wMS5zdmcAAAAVY3J5cHRvY3VycmVuY3ktMDIuc3ZnAAAAFWNyeXB0b2N1cnJlbmN5LTAzLnN2Z/////8AAAACAAAAeUQBEEFSBGBQhBokIWARSoSUGlmBQEBJUqkWEQYmAQKSAVGWgEEFVBARJApVgmUZBJZSkCUkYVVRAFBBUVBIBRFFRWARVmBAGRhEQGEJQBARiVRliVUlhQYICZAJgIJQEEWVJoUEGWVCAERpGRQFUVRGRZQRgZQBRBkAAAAA";

const chunks = {
  "cryptocurrency-01.svg": new URL("./cryptocurrency-01.svg", import.meta.url).href,
  "cryptocurrency-02.svg": new URL("./cryptocurrency-02.svg", import.meta.url).href,
  "cryptocurrency-03.svg": new URL("./cryptocurrency-03.svg", import.meta.url).href
};

register('cryptocurrency', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
