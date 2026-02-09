
import { register } from '../core.js';

const lookup = "AAABj4kZARsYORr3us7EWB0yo0NxNLJEmXdhZlQjRWV0dGNEYkQ0hZORZUdzCFg6BJlBDgMCAgLCFAYD2QLzASegA4oCKQUBGwweAgsEIAGKAwEvBQ1EFgELBLcIAssSWAiqARYbARGlAQJZARsYMNc9C6lGFkgAEYbC8yEvOZ0cknFEp8OOXIzhfNolff/+VQe+sO2PRzqWQ/7W2pnvn5Rpvyk7tDqPiH8SJlsD7n8/NgVOER1r0XPsvb/VuUNj9yAXh/4utqQyW7ShsbeLCUO9JXU0aWxlN1/5VlbZLp6LwawAv6ScEL7btGBDEiPDrh1fccht8Q3jIA8aJpR2VxUKA/4CfmkMJy0CDMs4rUcmHRvO9Bc5ZxXmk2AxyZvjLMPNHayz8q2RopXwxJg1Tpit1Bm+q8Au09O/YG03u1q6zSyVNExH/bXSFLrfklKJ2/IsC8gdVkPzokRrh1KZlLeshArzpc0TnNcjFF8bO9pcaAXkQu1n20/OB5y76X05B+vycDTwYFAjSMUABANACAEAAAAAAAIAAAARZm91bmRhdGlvbi0wMS5zdmcAAAARZm91bmRhdGlvbi0wMi5zdmf/////AAAAAgAAAEdEABRQVEQAQBAAFFEBAAQBUERUBUQAQAFEBAAABUAAAQAUAABAQQAEAAAEBQERAEQAQEAABQBEFEAQAEAAUBABVVQEBUAAEQAAAAA=";

const chunks = {
  "foundation-01.svg": new URL("./foundation-01.svg", import.meta.url).href,
  "foundation-02.svg": new URL("./foundation-02.svg", import.meta.url).href
};

register('foundation', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
