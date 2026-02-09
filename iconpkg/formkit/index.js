
import { register } from '../core.js';

const lookup = "AAAA0okYkBgdGmULO2JPZESHVHWmcSUnZTdiRUQEWB0QXQ8ZMvcMCRE8A1SaA2ZRkgIHOAwFAQEFGwcNBQJYkC8nlKlGvrpH5zEhtyRO7vIpubW3O7RTjP59CnFxh35RvrYLCjGBOZgwHmhFgzQMweLwIEZb3huosWhuoDL83dfPsPQmU0LhpvxEfCGmRwKjs7TOnkhOg0EEo1+MB9jXoioAjMMpOA5pladv+DLX+RUURPwMEq5Lr7OtsvKrJGd4qbzLk1G6UF11Y6YEgqzaFEQAkAIAAAAAAAEAAAAOZm9ybWtpdC0wMS5zdmf/////AAAAAQAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "formkit-01.svg": new URL("./formkit-01.svg", import.meta.url).href
};

register('formkit', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
