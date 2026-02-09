
import { register } from '../core.js';

const lookup = "AAABB4kYthglGg0kUnxTVXpVRiOEZ0ZXQYoyOFc1JkUVAVgnFCmAE6UBFAJTEgIBkAILLgEGwAMBMNsLhwQE6QUDhQIgClABCAkrAli2jyekvQeOHyZKlDQn/1PQGmQcNRZ+MueGOFFJvJrXrYuJRbBVgUAnliZklJoeYnl9FmJpfSbEcgii1lQoiX3/0lgcu5XpBHYs6bxUCZt+P0pFtZNX6V8wAA+fZUva4A34I87Rb6c43EbJu9UeYqYlkBNXOlc3XWYZIWQ15W0zY5cayyhhoSHamDJz1eB7S/8UsBacDsW3WxQfexil9/xs9jrAwezIa+Hg1fhcrYmgXgHgmPQ3YVNFAAREIBgAAAAAAQAAAAxjdWlkYS0wMS5zdmf/////AAAAAQAAABcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "cuida-01.svg": new URL("./cuida-01.svg", import.meta.url).href
};

register('cuida', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
