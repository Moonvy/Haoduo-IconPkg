
import { register } from '../core.js';

const lookup = "AAABK4kYzxgqGuYObwlVajV4MlRDgmUjSlZUcFdCJFQmxmVGWC/ZFSIPCIYEjAEEGwULAd0BHgMBAaA4DA1fAwjrA/4BQQQDBQEBHU8Dy/UBETYKCQJYzy2hc6APlES+hxOsbKcRlskJdH/VODQec5Wsd98jGRyToGzgkT9LByjPrHDyFNJ0xBsoPa3kawtGBgNbnwF3yBUK9ntTX3Y+GwXPOQwcenm+DByiGCFttslgeqsdaEGzMRVSLL79rsNsu2C53NNXMPVpOy2macnixfGAcKf5Hh4YN7CtrEYU3uOsUiHayvh+TdNdZZMd153Ikm91Lrob9J4iC/gRVrjHh+ehYb1DCgNlNooMmHGdgSvwiVW1jwnnPvmBhParqwIzKPwCOuoVjUZAAQABCAAAAAAAAgAAABBncmlkaWNvbnMtMDEuc3ZnAAAAEGdyaWRpY29ucy0wMi5zdmf/////AAAAAgAAADQAAAARAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAABAAAAAAAAEBBAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "gridicons-01.svg": new URL("./gridicons-01.svg", import.meta.url).href,
  "gridicons-02.svg": new URL("./gridicons-02.svg", import.meta.url).href
};

register('gridicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
