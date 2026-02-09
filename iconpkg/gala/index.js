
import { register } from '../core.js';

const lookup = "AAAAV4kYMwsav/HEu0ZlQ1NTdAZMCToJEwI6BIwBAn0bAlgzyksKtP1pWGEBG5X5OrT4P8IqbbImekDskiOugt69ON6rvnSAOmH5RKDfvFPzg9eWJAmmQgAAAAAAAAEAAAALZ2FsYS0wMS5zdmf/////AAAAAQAAAAcAAAAAAAAAAAAAAA==";

const chunks = {
  "gala-01.svg": new URL("./gala-01.svg", import.meta.url).href
};

register('gala', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
