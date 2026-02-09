
import { register } from '../core.js';

const lookup = "AAAAOIkYHgYawDttZ0NjZlRGAboBJAkLAlgecUkvekH5nxlHLgJjBvVT3z0IQZfANDFrIi2ea6tIQQQAAAAAAQAAAApnZW8tMDEuc3Zn/////wAAAAEAAAAEAAAAAAAAAAA=";

const chunks = {
  "geo-01.svg": new URL("./geo-01.svg", import.meta.url).href
};

register('geo', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
