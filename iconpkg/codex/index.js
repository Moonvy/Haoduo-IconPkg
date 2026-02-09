
import { register } from '../core.js';

const lookup = "AAAAd4kYThAaPb5RiUhDZVRTQYdGhU8UAUAYJwQNAlLKARADwwICWE4LBs65c7xl5tNxz61RlotYPxuHcK+f7WzX9JP9xjEeAhSUJJXirgIHUoCs2qRwcn7ogrLyB8vM80J7Hm9E/9V6WT6SI/AgKRymQboeHslCAiEAAAAAAQAAAAxjb2RleC0wMS5zdmf/////AAAAAQAAAAoAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "codex-01.svg": new URL("./codex-01.svg", import.meta.url).href
};

register('codex', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
