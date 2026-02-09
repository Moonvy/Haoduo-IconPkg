
import { register } from '../core.js';

const lookup = "AAABMokY1hgrGv0pR+xWRTREl3QTZDhEY2VZY2ZDVXSSZlc0BVguGAYPAwUFrwHTDQauAQEOJZkDBQYHfQgL6wQhClQnAgMOA0IBIQK8B1cHHwEVJwJY1jiwitld+gceArbjFPIcjEry/uEgwLYjFxRnqIf9lUEhYJX0tXuuZwW9HjAGOTYGQ21//Sr+bcsCGu9xk6QZw2hSvtYzxkvaDSHWXCXJslPQwtwSFnrXX1HZtwswYFDwYRdXwR7OtJ3ijvigmpsvrCn//r/yX1LFQ1AQhWnXLoOwxBC36HvcA4R1+Tspz/InsCKS5iQedeZOvTtWhwloG4DONxJyYBvTpgpvkKc8RGK0bdEcUE3Kh7hSuVoiSRuJoSwdKH79JvEpFfmn0L5pnVzWLCrLbE9GAAgEAAACAAAAAAIAAAAKdWl3LTAxLnN2ZwAAAAp1aXctMDIuc3Zn/////wAAAAIAAAA2AAAAAAAABAAAAAAAAAAQAQAAAAAAAAAAAABAAAAAEAFAAAFAAAAQEAAAQAAAEAAAAAAAEAAAAAAAAA==";

const chunks = {
  "uiw-01.svg": new URL("./uiw-01.svg", import.meta.url).href,
  "uiw-02.svg": new URL("./uiw-02.svg", import.meta.url).href
};

register('uiw', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
