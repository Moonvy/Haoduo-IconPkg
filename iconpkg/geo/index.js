
import { register } from '../core.js';

const lookup = "AAAAOIkYHgYaqDSXWEM2SlJGdd9GEgEUAlgelwgvwCJIet9jQZ5xRxktLp/5SWurNAJrBlMxPfVBQQIAAAAAAQAAAApnZW8tMDEuc3Zn/////wAAAAEAAAAEAAAAAAAAAAA=";

const chunks = {
  "geo-01.svg": new URL("./geo-01.svg", import.meta.url).href
};

register('geo', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
