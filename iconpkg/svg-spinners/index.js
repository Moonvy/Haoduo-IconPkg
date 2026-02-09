
import { register } from '../core.js';

const lookup = "AAAAT4kYLgoa+3+SdkUyViNXZ0oCXksBAW4JkgErAlgu5ssMq0iKVieZDW5IhVpeDzlebrzZxZP76t6sj0aN4vXzCuJLaPIjK4DJTe7OBEIBAAAAAAABAAAAE3N2Zy1zcGlubmVycy0wMS5zdmf/////AAAAAQAAAAYAAAAAAAAAAAAA";

const chunks = {
  "svg-spinners-01.svg": new URL("./svg-spinners-01.svg", import.meta.url).href
};

register('svg-spinners', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
