
import { register } from '../core.js';

const lookup = "AAAAOIkYHgYa845a10OgVVVG/QcCBUICAlgenwh63zQuay1TnvkZcUFr9ZciR8AvBj2rSWNBSDECQQEAAAAAAQAAAApnZW8tMDEuc3Zn/////wAAAAEAAAAEAAAAAAAAAAA=";

const chunks = {
  "geo-01.svg": new URL("./geo-01.svg", import.meta.url).href
};

register('geo', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
