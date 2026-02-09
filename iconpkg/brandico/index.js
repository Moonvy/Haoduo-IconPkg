
import { register } from '../core.js';

const lookup = "AAAATYkYLQkaqmMR0kVkYzSCCUkNXgEaAY0CmQYCWC2tOXNOdkJvVt3ojbB9nAenQR4MIbWUUX5kQfCmr8QBz7h+/M0mQJodAKFStxRCYAAAAAAAAQAAAA9icmFuZGljby0wMS5zdmf/////AAAAAQAAAAYAAAAAAAAAAAAA";

const chunks = {
  "brandico-01.svg": new URL("./brandico-01.svg", import.meta.url).href
};

register('brandico', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
