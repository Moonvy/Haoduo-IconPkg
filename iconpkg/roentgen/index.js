
import { register } from '../core.js';

const lookup = "AAAC04kZAgoYaRq4BKLSWDVVZkaFdIYkd4gnUjYzcUNHJZZAJWdVZVk1VGg3VWY0lpRkMjQzgGJltVVWUnZXc0JWkyYCB1hxTD8yJiYgM7IFAtIBA/QBByDUA94BkAMBEXwCA1YBDCwDH5sBYkCSATMHCg0PtQI3AgMEJtcB1AErCQoGkgJfAgYyuQ0PsQEbPwEOAwEHAf8EAZIBBCEn2BInUOQBAQIJJZoCkwQXASACWAeOBCQBlAICWQIKpbQBZ2EO87xnDwgf2GkCxU2T2P99Wp+ZITnarl88xsJ12Kb2eweYcNdDKRHPWz0H/rMTJGBOyE3P2VJ213BoMuzgxymTe11APzkcmm9P6qMnVPzabxMAiCPrWbMieb+LhrRdHvlQR6mDvuI8o1Pth5zmu77DYbsUinZu1B2qkY7GoybiR/xspQxyf/QfDNvk//VIEEXguLCGsjsWSQ4DFQorekavPPeYW/LU7wCOc9Vod3vqxpMnGCYfBjPRjwdnEcHuDUK1CLi/aZlfw4UtOp1I2aJyMyVLRMvJht2I7Gx/CseFcAq6C4ypS5hp6O+f/NmXy3/vSuWJF6uYo1jmg+xCEqkFAXiZKC+LaGX4lOqxb9IzpOZuexFrUtH6nzo17Vi76Wod+n7Pgnp+GregPo0vvBus+NcppK+84/fUySom2shdOBkVPhN/qg93CQR4UyhmR+esleP2H+JFlX8hQdk9VG3gFUKl/Mz6xEImwdtR4ugybOOl/+62QILHRxkm8LaPTIfd0sPJaFCMfTYz5jLy6sM3cL5n5rhS1/bkkuKM4lvLHX1r/B4ddO77lFPEkFu/jQVrJtHC/cweBEmYN6lhui8VtgaR8rCBdqOo6lC5OZsuZeWfsTiWYmMsHI/l81b15587iGxYdRSlaaa/Ds/yrUQ3F2QoeK7xPOu1IHwt5+wITCTsxpSkTgAwCAayAAAAAAQAQMQAAAAAAAMAAAAPcm9lbnRnZW4tMDEuc3ZnAAAAD3JvZW50Z2VuLTAyLnN2ZwAAAA9yb2VudGdlbi0wMy5zdmf/////AAAAAgAAAIMmRIAoASQBWYgWBRZQWqZKiFRCQJgllAhGYoUZAAIUIVZWBJKAGGRFkFkKAEiBFRSGlEBJEaSVWVGVEBRlJEYEFaVhqEaRZFIkgFViWQUAgFSAJgUQWZYRaREWZRZQohJCgEFkSiYRFBAlCBGVQJYRqAgIRgkZFVEEBAUQVWoqpZoJAgAAAAA=";

const chunks = {
  "roentgen-01.svg": new URL("./roentgen-01.svg", import.meta.url).href,
  "roentgen-02.svg": new URL("./roentgen-02.svg", import.meta.url).href,
  "roentgen-03.svg": new URL("./roentgen-03.svg", import.meta.url).href
};

register('roentgen', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
