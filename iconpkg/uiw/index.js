
import { register } from '../core.js';

const lookup = "AAABMIkY1hgrGlY37tJWYldQR1UlWFOFsURURHRUNUZGVIt1AlgsBDINDM4BDQgDAcQBEAEKEu8BxjMBBRAlDg2mAwIbHAEKFTEhDyjSONECD08CWNbOFLbopyMSHGJBAsp+SwfLJykX1oqoBrCTImAmFg0pJNrvw/6whZrTHvLQ2UpEEPGntc7mxP3wOP/AF9CHwf0UTTP98mxOaI4bGfk72dy917AGA2FWHdb+UvrPZ5Xcy20JZ19QBTAqg4e0XMYsQ1++e4QuIC9oUvK0O/RQoGDy0WlvwkO9rocbSX9SaZ2hmzwSuU+3cTd6ssl7pvgwiRqA4iGVuCG/LOGdjAsKdSgibRxgU1C2pJLW/te3chVaHjkQxQJXKZBRbeYqrBvjHl2+dSUe+Vw2RhEIBAIABAAAAAACAAAACnVpdy0wMS5zdmcAAAAKdWl3LTAyLnN2Z/////8AAAACAAAANkAAAAAAAAAAABUAAAEAAAEAAAFAAAEAAAQAAAAAAAAAAAAAAAABAAAAAAEBAAQAAAAAAAAAAAAAAAA=";

const chunks = {
  "uiw-01.svg": new URL("./uiw-01.svg", import.meta.url).href,
  "uiw-02.svg": new URL("./uiw-02.svg", import.meta.url).href
};

register('uiw', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
