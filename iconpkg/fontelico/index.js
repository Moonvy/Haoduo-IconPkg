
import { register } from '../core.js';

const lookup = "AAAAPYkYIgcaTza3g0RkMYUHRgMVAQotMgJYIixdyhS4F9I8+RsyNiL/XJeq7+Vxvo0thBsEof03EhKdxkBBBAAAAAABAAAAEGZvbnRlbGljby0wMS5zdmf/////AAAAAQAAAAUAAAAAAAAAAAA=";

const chunks = {
  "fontelico-01.svg": new URL("./fontelico-01.svg", import.meta.url).href
};

register('fontelico', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
