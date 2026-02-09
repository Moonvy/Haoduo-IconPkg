
import { register } from '../core.js';

const lookup = "AAAAdIkYThAa1UUwKEhkE4M1OZNEZ0wOGZkCLgJwMQkDFgwCWE6Acx5CfmW6/a0CPwuvbx4g8HvTWKzOHHpylp8G8tft4rLLMYdwB0T0UpRxHqZRybzoG5UkAouSuc9BWZPGFPOk1XCu/z4p2gfmI4JsHsxCHAYAAAAAAQAAAAxjb2RleC0wMS5zdmf/////AAAAAQAAAAoAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "codex-01.svg": new URL("./codex-01.svg", import.meta.url).href
};

register('codex', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
