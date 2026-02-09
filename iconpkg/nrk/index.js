
import { register } from '../core.js';

const lookup = "AAABVIkY8RgxGmUJ2iJYGWNDRVg3NmJmdVp1ZoEypDRDFWZndjSCVAFYMAJDBQoEArkBF9MCFAECRQZGEfMC9AIEF3IdMg8CArMEAgQQDicPLAgT8AEDtgMgIAJY8QCgcqDlSRiyx/H7qVjDivnWMNeFvkZ1fbNstiqtO21Q2rRvmFj+lNwHufKT2vwkIdGqBHVNxRsuoJR+dGz+uupngiyTj3bHA7LXnNcDgtZ6eV3QZxq5JlFUqK7Zl2KpK/doi0ZwDoIHKS/ylc+Fl5W9VKHhm+hG0dP6uOssbmdID+jvAhVb9tlfH3BKNq67MOpS6tLBqaUlE9aEX6g0IVasYYcKnhkHqSfSIGqSyx44A3i/1yH5huZ1pvNUG3Vgj+XZUH3rImhCc3p8T2gxwJEU1fMS5caUMSVAOTEyRKVAj7HQc5RfFR4zn7696Ju9JCNHAAIAhQgUAQAAAAACAAAACm5yay0wMS5zdmcAAAAKbnJrLTAyLnN2Z/////8AAAACAAAAPREAAAARAEAARBABABQAAQAABAQUAAAAEAEEAAABAAAQBAEEEBQAAAEAAAAAQAAARAVAAABAAQAFAQAAEQAAAAAA";

const chunks = {
  "nrk-01.svg": new URL("./nrk-01.svg", import.meta.url).href,
  "nrk-02.svg": new URL("./nrk-02.svg", import.meta.url).href
};

register('nrk', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
