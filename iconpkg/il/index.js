
import { register } from '../core.js';

const lookup = "AAAAgokYVBEaoKbxd0lKRUoyUzg3ZgFSqD8DATqHBwYBBQFQ1AEDGW0TAlhUpz8w8iuiYAH+Pdn4rSktQRkwX/GgsdPym1L4aU69f5iivb79fjRChyT+jMj+bf85jA74GA1b6Xm63zIeG361prTzrHXwHTqVM3MxLPOKYGy5FTYYQwAgAQAAAAABAAAACWlsLTAxLnN2Z/////8AAAABAAAACwAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "il-01.svg": new URL("./il-01.svg", import.meta.url).href
};

register('il', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
