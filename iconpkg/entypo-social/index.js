
import { register } from '../core.js';

const lookup = "AAAAdokYTBAaphlNvUgVpjWkNjU0YlBCAvoFSQwOvgRDAgkDBQRBAlhM4c1qurQFzIOL/IhvQsIT0ZhRWonsXDCiIXYS769CufcQgAuyQB46ZQNvJbarovVOtzhZlfNHHX228I9h8i7DU9Whxiqkm5gMmUGF6EICCAAAAAABAAAAFGVudHlwby1zb2NpYWwtMDEuc3Zn/////wAAAAEAAAAKAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "entypo-social-01.svg": new URL("./entypo-social-01.svg", import.meta.url).href
};

register('entypo-social', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
