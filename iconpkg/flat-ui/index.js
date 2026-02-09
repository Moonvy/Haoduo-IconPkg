
import { register } from '../core.js';

const lookup = "AAAAlIkYZBQazvmpjEqEpzUYhHYlNDRiUwZ4vgLgDAkByQEFAy8sBQkCBAQCWGQgllQ2gzX+jG8ONP/5qwev+fSs5khzLUrk/ZB1kLzIR6ZQRLq86zSircWjvw+olQJHJpJp1OJdsvLEbE4G0SrzjG2oJeVmJDK2t/mTbs/skv+XpznL9Oo5DWce9Ncla07b1xvmQ4AgBQAAAAABAAAADmZsYXQtdWktMDEuc3Zn/////wAAAAEAAAANAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "flat-ui-01.svg": new URL("./flat-ui-01.svg", import.meta.url).href
};

register('flat-ui', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
