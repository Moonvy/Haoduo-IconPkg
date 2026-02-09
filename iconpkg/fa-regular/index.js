
import { register } from '../core.js';

const lookup = "AAAA3IkYlxgfGss0HeJQZEUrNmJXZEgkFkdThGdEA1gfAxAxD78kAnoLswE4JAjSAwwEAjiqBAwNDMEEVDYCAQJYl4F+omnjJb7lhfMea8u+SI6x5h7yINWnQSRagJU81CSMN7h/8Rbs5zuT4tpglt2LHK0Zgv2vy+vkuT+E5HbPJdCbgTnXdOQJjxLsIacK+BMPUvHsUwnWoKLtWPJwlgx60JbyGHJqJ0SwCKhpJp4Ls826Eqn/rBf+rRsddyrxAj97J3DmhwbHBC4WSna9MistJI7FB09IrRtEABFIQAAAAAABAAAAEWZhLXJlZ3VsYXItMDEuc3Zn/////wAAAAEAAAATAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "fa-regular-01.svg": new URL("./fa-regular-01.svg", import.meta.url).href
};

register('fa-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
