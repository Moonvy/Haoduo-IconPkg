
import { register } from '../core.js';

const lookup = "AAAAjYkYWxMa+wFUdEpDMWp0ZlI2VnIFVQQGAcwJlwEHuAFoswEEFxYFAQMWQwJYW7aNUamjwWltN63X1vPth35tZVk5vhbR/XrcWttwd1NStjgJQtBS2ZqbdcVToIdGFubdcJnbk8uVjYfWnD03I75/B0J1mMeVojiJbBEzsSRx+D7CDeiLt6x2jQ9DBAQAAAAAAAEAAAAQZHVvLWljb25zLTAxLnN2Z/////8AAAABAAAADAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "duo-icons-01.svg": new URL("./duo-icons-01.svg", import.meta.url).href
};

register('duo-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
