
import { register } from '../core.js';

const lookup = "AAAAV4kYMwsavPTxNUZjU1g4UgNMCRYDBncG6AIFASsCAlgzoHQ/lmmD3pKVgMp6WN5L+Rs4JrK9JDoJ+LwBgrTf7KbXRCphqzq0I/Ntwvm+U679YQpAQgAAAAAAAAEAAAALZ2FsYS0wMS5zdmf/////AAAAAQAAAAcAAAAAAAAAAAAAAA==";

const chunks = {
  "gala-01.svg": new URL("./gala-01.svg", import.meta.url).href
};

register('gala', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
