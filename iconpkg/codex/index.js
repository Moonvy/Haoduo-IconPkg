
import { register } from '../core.js';

const lookup = "AAAAeIkYThAapQS2M0gyVkNDWVdDeFAFOxsLAhCfEQwvAwcYvQFHAlhO9EIcspQLZcytpAfoh4Ie1fLXcFK88JKvriBRB4DJ81nLbH5BPkRzch66uXviJOZYAh6LBgL/ztoxKaYbz8YUcHoe/ayVb5+T0yPtlj9xQhEAAAAAAAEAAAAMY29kZXgtMDEuc3Zn/////wAAAAEAAAAKAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "codex-01.svg": new URL("./codex-01.svg", import.meta.url).href
};

register('codex', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
