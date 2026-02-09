
import { register } from '../core.js';

const lookup = "AAAAb4kYRQ4ayP+8p0dUUzM5dWY3UQ4bCAQCAooTAY8BzwEPqwIBAlhF28isKwWyu47iJ+Uqf3kFGZNAORODQOcOo4nm5X1tr8A6tHXBhUxh5BDuCy1RfaWjEvnI7A4JKhWHzaU5Vf/FuD8pdsOmQgABAAAAAAEAAAAPbm9uaWNvbnMtMDEuc3Zn/////wAAAAEAAAAJAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "nonicons-01.svg": new URL("./nonicons-01.svg", import.meta.url).href
};

register('nonicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
