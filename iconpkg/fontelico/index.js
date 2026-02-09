
import { register } from '../core.js';

const lookup = "AAAAPokYIgcaQTaLkERnFiQIR9MErQJE1wICWCKNyhtALJfShBcSLRQ8NjcyIsbluKr/Xf0SBKHv+RudXHG+QTgAAAAAAQAAABBmb250ZWxpY28tMDEuc3Zn/////wAAAAEAAAAFAAAAAAAAAAAA";

const chunks = {
  "fontelico-01.svg": new URL("./fontelico-01.svg", import.meta.url).href
};

register('fontelico', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
