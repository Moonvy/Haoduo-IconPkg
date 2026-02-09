
import { register } from '../core.js';

const lookup = "AAAAg4kYVBEadR+A9klTVWWSJZRHdAJTAh0VFwdHATwTFf0XkwIBBqUBAQJYVBX+ND3wKykbMHX9fsh580Gnik4yLG29OjNs6WAB+Bi6jKDf87UONjGbvfE/f/J+X5WMorm+GGBCrf6ipi0k/zmYW9OsMBmxUg34h/jZcx7+tGnyHUMAAgAAAAAAAQAAAAlpbC0wMS5zdmf/////AAAAAQAAAAsAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "il-01.svg": new URL("./il-01.svg", import.meta.url).href
};

register('il', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
