
import { register } from '../core.js';

const lookup = "AAAAbYkYRg4aZGA890dFYWYzZ1dWTgcFVqoCUgPQBBJvDh4SAlhGqVnjOqwbB3TFfqgHG+n16pW/h2BSoGy5bLpFNW0sxzCMGfSm93OqXx6fSOh8GM83jLhEkvPyXxUUIj9oHoJ2vfIdlbNAt0JEAAAAAAABAAAACWVpLTAxLnN2Z/////8AAAABAAAACQAAAAAAAAAAAAAAAAA=";

const chunks = {
  "ei-01.svg": new URL("./ei-01.svg", import.meta.url).href
};

register('ei', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
