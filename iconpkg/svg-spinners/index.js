
import { register } from '../core.js';

const lookup = "AAAAT4kYLgoajcKtNUUjUrJ1ckoFAwfsBg/YAgJhAlgu2fuNSN4EvJmKXuLm8ytaVoVoycU54kgKbgxNRvLurJMPIw3qJ/WPy25ezquAS0ISAAAAAAABAAAAE3N2Zy1zcGlubmVycy0wMS5zdmf/////AAAAAQAAAAYAAAAAAAAAAAAA";

const chunks = {
  "svg-spinners-01.svg": new URL("./svg-spinners-01.svg", import.meta.url).href
};

register('svg-spinners', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
