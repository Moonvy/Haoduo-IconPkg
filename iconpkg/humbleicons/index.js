
import { register } from '../core.js';

const lookup = "AAABl4kZAR8YOhpbCSQrWB02VWQ4UnVpRVVjM0UyM1hUcyU1dkZXM2NWhSd2iFg+VAEDCg4cnwMFBibzAsICLBAEBQoBHAUaAgEBkgUOAwcE8AICFwIV9gEFB1sIBAIGNR01Fq0DMELzAugEgQICWQEfO60+eoLJ9ME7hbcR2C65nxSk1fJRvvcbymsVftriZL+Vglezwp1RCgVuyRxGgSJMFnUeiYH+GpUYmEiPnyzW/2kec26D7PKMPwE8Z7dL86yOxvmWMUe+xRSsfjNubZBpA1tQ630S7cTfA0RFlUYsgArtW2yHR/SphYvu0Xsb5HPvPJHm0QV1ELqmdgJakTIwsLMXc9H9BjNRQrQsrG0qxSZ4xn7VsCsw5qn92LkGUYwkoBcJl7bIEOeY5gf7Fxg2ytnesNvAyPwxOl3ih/2y718YVazd4KOSjK4+U1LPvvMRfFHXtbpV8anDKkFgzj4WZVivCa5yfhgATiJgD5Fsq0hqSnfNAQYXqcc7U4gPPMUYOawhimwBeBc8wb+nM/dIgACQBAgAIAAAAAAAAgAAABJodW1ibGVpY29ucy0wMS5zdmcAAAASaHVtYmxlaWNvbnMtMDIuc3Zn/////wAAAAIAAABIAAABABAAFBQABRVAQAABAFEBQAEAAUQAAEEVEBAQEQQEEEQRVAARQUEEBBAQBEABBABAUARUEAEEAUEAUBAEEVEEARFBAQQAAAAAAA==";

const chunks = {
  "humbleicons-01.svg": new URL("./humbleicons-01.svg", import.meta.url).href,
  "humbleicons-02.svg": new URL("./humbleicons-02.svg", import.meta.url).href
};

register('humbleicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
