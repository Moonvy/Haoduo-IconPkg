
import { register } from '../core.js';

const lookup = "AAABJYkYzxgqGratg1BVODZVUkNJIzQ3NlNVhSR4VoRGhyR2WCnbBAIpASUQDQMM0gsiAgrpBAJBFRAHHNYBBwFIaDUHC4sDGANkfgY0TAJYz4kDU/gCxL6iz6wek/Q+4tccAxv2tRjFgWAF3Ks45zFzKI0j5x1plCE2Gx7yZZPkNKH5f4oTpvZ0hMmnHdp247YJvS1B4F17d0Rbvj1SCjrVS0YuFf0cN51srAz4aJjSBpZNV2ELbJKBbcqsaWwJ6mXwvhu4FBg7ldN6z6tSrn75KAysoK1z394VrXe5w3W6uw8i8Z5WyQGHa2AHdBEceh4ZC4BfMFVvkQoUAp0rKMf8cfXTsxU5q6AsLbCnRsihyax5IQyPPjPIcHCfQ4c/EUZAkBgAgAAAAAAAAgAAABBncmlkaWNvbnMtMDEuc3ZnAAAAEGdyaWRpY29ucy0wMi5zdmf/////AAAAAgAAADQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAAAEARQAAAAAABAAAAAQAAAAAAAAAAAAA==";

const chunks = {
  "gridicons-01.svg": new URL("./gridicons-01.svg", import.meta.url).href,
  "gridicons-02.svg": new URL("./gridicons-02.svg", import.meta.url).href
};

register('gridicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
