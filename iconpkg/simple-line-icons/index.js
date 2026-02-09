
import { register } from '../core.js';

const lookup = "AAABEokYwhgnGldwrZ9UElVaVzRXhGUVlEgyNGVktzV0CANYJQYH80cKCR0PFOQBK0AFeBoH4xKzBgEmTwoXtQKaCRgCB2GhDwECWMJ16BS/uj1yW59J6tm5Bwiwi/t/Wrfd9jlOOrW58ti9drp4ICESq4MA60RWv7IsuI7JcLBwiUpY5KvsoEYvUuBXGwB64sN0FTbj/sEHbBz+HKKoY1sdGqc7fNG/1mQ1xG0HVlW5GfnXZViiHYb76dacrv7PCVxb84lbFVgrYJjwL6GcDgFo0VJAB74GveYP28BHzhvSfimM8qRpoyUBke40JV8FD5B545U28/1uh7zsilhGKpUmYHs/rESMPYJbEQomHEUDEMIDIAAAAAABAAAAGHNpbXBsZS1saW5lLWljb25zLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "simple-line-icons-01.svg": new URL("./simple-line-icons-01.svg", import.meta.url).href
};

register('simple-line-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
