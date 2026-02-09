
import { register } from '../core.js';

const lookup = "AAABJ4kYzxgqGo6RtxRVQzJjRFVVRUh3dRVVNmVEeHUXVUVnWCsEAQcIRAUGFQZNExkjpgEcggGAAS0UASBaAR4xFgLfAVlMXyQMBgQWqAJTAljPV8j1cCtEdUGfk1Khp4oDvcNG5/hzKKEcgKC6rp0wOAXJLCGrHqwjaxM7lCizAjEZaYm4ydXfq3ozhwMVdG8bLc+eyqyi3JgcHXlsCg+tRvaSbBV7+HEMk+IMkWwelTlfTR1wYcR2GKw+0ncejZZt6sVbfz5+Ii6B16cJ2hj9dKwK5DaguRy+KPK1IQE3LT30Q0vwadPJsNPICWUbh6zHhIG+FPkLprsRZRX5DM/gG4+tVvFzNKtV53o6FPYGYLZgEVNdvgvjaHcCB/yd3lI/RgQAYAAIAAAAAAACAAAAEGdyaWRpY29ucy0wMS5zdmcAAAAQZ3JpZGljb25zLTAyLnN2Z/////8AAAACAAAANAAQAAEAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAEAAAAABAQAAAAAAA";

const chunks = {
  "gridicons-01.svg": new URL("./gridicons-01.svg", import.meta.url).href,
  "gridicons-02.svg": new URL("./gridicons-02.svg", import.meta.url).href
};

register('gridicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
