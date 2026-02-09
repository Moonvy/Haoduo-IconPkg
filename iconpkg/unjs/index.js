
import { register } from '../core.js';

const lookup = "AAAAZokYPw0aRBsPuUdCaGZoNDUCTgEChwEgNgGZBJABBQceAlg/VmQHV3crf7ugDQrk1stXd5KyGr/c4oBoJ7tJEmUVjqFEFYtUgiM2ZNF8Mq0yxDL0MSzHbD3d7sU7xMn5sfLMQgAYAAAAAAEAAAALdW5qcy0wMS5zdmf/////AAAAAQAAAAgAAAAAAAAAAAAAAAA=";

const chunks = {
  "unjs-01.svg": new URL("./unjs-01.svg", import.meta.url).href
};

register('unjs', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
