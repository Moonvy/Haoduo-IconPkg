
import { register } from '../core.js';

const lookup = "AAAAl4kYZBQa2C5CM0oVQ3VFNUVpVYVWVhcIAhjBAVYIDQEhAZAPGRUSH+MCAgYCWGRwB3rwIRkv6ZWhzn6r2IwC19KCGS7HZ6a6B3oeuJtbYEGWVOYGzmxV1K1rR+JOKKyefp8nHqKfM/PDLRs+fnXy9xen0RUs1/9zBDtryCKthA+YO+3Ov38dWx0pUOURJq23yJSYQwIAAAAAAAABAAAACWV0LTAxLnN2Z/////8AAAABAAAADQAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "et-01.svg": new URL("./et-01.svg", import.meta.url).href
};

register('et', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
