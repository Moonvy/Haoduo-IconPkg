
import { register } from '../core.js';

const lookup = "AAAA4IkYlxgfGjWm5llQh0NkR2UnWGNERHUUFVhEBlgjkwGGAgECCxb2ARcKQZIBAc0BDgN6BQcPJBWIAQY0CwQDIjwCWJdPjxmWi+Mq8kge/+QTahLPFj+t5p4W6yQK4kjsdnDmuiuE8tCnRHe+EvIgOxupgTKvlsXsx+V/7SVyzUrxLVqBgucLgK177MuoQY4k2iHdua3Vk5Z2JT/XWCc3ywh6BqeV8eQnjBsCLh1+CYcmooW9oFIkotZwPLjz1P0XHr4E8Q8Ym3Q5HGsHU9Cwaf6sDOSOs7FpYAn4RAAAgAIAAAAAAQAAABFmYS1yZWd1bGFyLTAxLnN2Z/////8AAAABAAAAEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "fa-regular-01.svg": new URL("./fa-regular-01.svg", import.meta.url).href
};

register('fa-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
