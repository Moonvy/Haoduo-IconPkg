
import { register } from '../core.js';

const lookup = "AAAAOYkYHgYaOPKzHEMkVmdHBB8UjwG5AgJYHkdI3waeMWtjIkktAsCXehk0q59r+S9BPVMI9UFxLkECAAAAAAEAAAAKZ2VvLTAxLnN2Z/////8AAAABAAAABAAAAAAAAAAA";

const chunks = {
  "geo-01.svg": new URL("./geo-01.svg", import.meta.url).href
};

register('geo', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
