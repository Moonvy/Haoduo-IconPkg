
import { register } from '../core.js';

const lookup = "AAAATYkYLQkauniC0EVEZiZVB0klEj1dJUcZkgECWC3NDFFOQUIHAJSwoR2t3X4hOX2nQcR2/BRSb424nFZkfkDomq8eprcmAfDPc7VCIAAAAAAAAQAAAA9icmFuZGljby0wMS5zdmf/////AAAAAQAAAAYAAAAAAAAAAAAA";

const chunks = {
  "brandico-01.svg": new URL("./brandico-01.svg", import.meta.url).href
};

register('brandico', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
