
import { register } from '../core.js';

const lookup = "AAAA1okYkBgdGoquM6pPaTaHMzVVZWU0ZiVlUmQFWCHYAnHVAQmAAYQHCQEKGDcEJViRAggDkAEXGQEZWQEMLQgCWJBBvm/PbjimW0QU14Hys+IvtSkUR675BHF4wSGvTh51t9doRrSpsbmHSFGm/mkEDoM72gzLsM4V/H2MTjHXogJEXSCoMKOVU4J8uvxR9EL8vkcS4fgyRSljOecytHGpMX63B96zjKYKmFCg8pNGtiQbZ6zwJsMLJJSySyGnKu6e3QCDjK1fvKs0J9gMCqNoU7pEAAIAAgAAAAABAAAADmZvcm1raXQtMDEuc3Zn/////wAAAAEAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "formkit-01.svg": new URL("./formkit-01.svg", import.meta.url).href
};

register('formkit', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
