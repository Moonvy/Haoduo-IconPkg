
import { register } from '../core.js';

const lookup = "AAAAnYkYZhUawVOxSUtHRjQ0k4NUGEVHBlgYEQJwCRIBCAMC1gwEqAQnI4gDEAmXBQFBAlhm9DgeFJUsHixGUL9QStKggoPzRBFYHoGHZydDlmkquQt/z2CjlYzMlj6mfmh7DButdVMnI5/3rDCdDk6+/QfXZce+A4fXDJ2+x3OnG7rPXHO9bfS/Mr0436xpurOrMP4OJLr3UgBEQwCAAAAAAAABAAAAD2J5dGVzaXplLTAxLnN2Z/////8AAAABAAAADQAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "bytesize-01.svg": new URL("./bytesize-01.svg", import.meta.url).href
};

register('bytesize', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
