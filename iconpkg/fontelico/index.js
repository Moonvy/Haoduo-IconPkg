
import { register } from '../core.js';

const lookup = "AAAAPokYIgcawEZ4TkSERkUDRw+IAXQGFQQCWCKhInEEPLjKN/8S+ZcXLBKEMhudLRTGvhs2je9c0l3l/UCqQSAAAAAAAQAAABBmb250ZWxpY28tMDEuc3Zn/////wAAAAEAAAAFAAAAAAAAAAAA";

const chunks = {
  "fontelico-01.svg": new URL("./fontelico-01.svg", import.meta.url).href
};

register('fontelico', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
