
import { register } from '../core.js';

const lookup = "AAAAdokYTBAaV22G3UilckI3JGFmVlANuQexAQEHtAMFElQGLCICAlhMb+HRpPwwolq2mM2DR4Cim2o6QpmvzO+JwxDylcZRDDhB9/AlU3Zl1QWFtEKYHsIhfaG2t04uElmyXLpAAxO5YQuI84tv7I8dKvXoq0IEBgAAAAABAAAAFGVudHlwby1zb2NpYWwtMDEuc3Zn/////wAAAAEAAAAKAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "entypo-social-01.svg": new URL("./entypo-social-01.svg", import.meta.url).href
};

register('entypo-social', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
