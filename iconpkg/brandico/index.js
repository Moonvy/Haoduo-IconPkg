
import { register } from '../core.js';

const lookup = "AAAAT4kYLQka7JPmUEVZZWZCAkuZEhQIJ9oCDwIBAwJYLbBWQh1Amk7EUaavIQCNrbXo/H12Hm9SZBTwDHNBzQGUfn64Js+hp7dB3Zw5B0IAAAAAAAABAAAAD2JyYW5kaWNvLTAxLnN2Z/////8AAAABAAAABgAAAAAAAAAAAAA=";

const chunks = {
  "brandico-01.svg": new URL("./brandico-01.svg", import.meta.url).href
};

register('brandico', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
