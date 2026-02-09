
import { register } from '../core.js';

const lookup = "AAAA6IkYnxggGplqdr5QYnVnI2gIYURzR4QYUlaDlFgjtwEZB7IFDgEBpQJPJ/8BCAw8OAIV5wPgBQEGBAYF4QMoigECWJ9q4AHvHRX8J6a8aSgsjTLZpti88qkYlAFNavNt+P9TwlLmdAFBdK0yLTvffFD3EZwXpGp6F+e0/rRbZpR+9BzydI2P/mM0QpP1oQrtXJopohq0N5Uoxn+pEDLR/IJH0JK22wjWdwi84p5ByHw40hVOVCmm2kL49pI8wDdRoBjnY+NBHz8lY8N/kuREr/3ZVs+9aPFfJy1okPzkBRUdgjFEARiBAAAAAAABAAAACXZzLTAxLnN2Z/////8AAAABAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "vs-01.svg": new URL("./vs-01.svg", import.meta.url).href
};

register('vs', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
