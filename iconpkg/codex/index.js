
import { register } from '../core.js';

const lookup = "AAAAfIkYThAaxuwVXUhUmEWHYkMzQ1QLPNYL9wEIBtIE5wUBNw4tDAwCCwJYTsYjfgfTUiBYbz+A2jEey66SBgIcPnJZQc7outd6ZdXPG/ICcMkpvK2frFFscbn/pofmi6SyJJPwzAdze+0U4kKVcAuvlJYegv0e80T0HkIAAAAAAAABAAAADGNvZGV4LTAxLnN2Z/////8AAAABAAAACgAAAAAAAAAAAAAAAAAA";

const chunks = {
  "codex-01.svg": new URL("./codex-01.svg", import.meta.url).href
};

register('codex', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
