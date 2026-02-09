
import { register } from '../core.js';

const lookup = "AAABd4kZAQYYNRpj+TxYWBtXJiYxVnREYllGZ0lgd5JYVXIkolOVNTZkRgJYOrQBLCUBJgECCRMyEQQBzgFpDmAIFR12AnPaAYoBAbkFowEBIAQBwwEJAgH7AQEdDsoQIgUZAxh8HQ4CWQEGhZgHYO0PoXXkkr3CyhyfYEZKHAxH5hT9A+XeGknzKRzVnGtH1zsBopU/u8Oms3WPo0hTtKd7Eeyk4ion5KnkbFF2An+YSLswuriFqSwLIdG+bGfLmxWzkNJoIHbQCmlTTIlOe8EyESYdbaO+6hajer+Vvz4slwbxoGBAHb2MFpSjrxKdbv4yejs5DCElthcHbKlyUO0kOK849/aDFagmLIXVaVdWIr5/sz/3rW7WTrX8JErjH1UtHRvQsqu6ljUCNjzKgOOwuT5oTH2tlndN6196Ki3edA/Pv6XrDMDRUA9rvzD5MO6vVVXWwX4ZnaV7XXAKc+WBcSLVdawi898N3PI+tyypHkdAAQABAAAQAAAAAAIAAAAMY2hhcm0tMDEuc3ZnAAAADGNoYXJtLTAyLnN2Z/////8AAAACAAAAQlBQUVAAQAAEAABABQQABAUABFBFEFQAAABAERAAABABQAAAQAAAQAQBQBBAARBQAQQBUAEQAAQAAABABQFAABQAAQAAAAA=";

const chunks = {
  "charm-01.svg": new URL("./charm-01.svg", import.meta.url).href,
  "charm-02.svg": new URL("./charm-02.svg", import.meta.url).href
};

register('charm', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
