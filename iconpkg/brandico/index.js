
import { register } from '../core.js';

const lookup = "AAAATYkYLQkaS0rmbEVkY2VIA0kEGQhSP3B8CQ8CWC1vuKEeQB1BjX1Wz3NOnJpk8Pw5AH6UrULddlEhB7Cnt8Sm6H4mtRRSzQGvQQxCAAAAAAAAAQAAAA9icmFuZGljby0wMS5zdmf/////AAAAAQAAAAYAAAAAAAAAAAAA";

const chunks = {
  "brandico-01.svg": new URL("./brandico-01.svg", import.meta.url).href
};

register('brandico', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
