
import { register } from '../core.js';

const lookup = "AAABbYkZAQAYNBrY3LRYWBpSdjVCRzZoVVVXZltmVGRDkzBZM0NDRkJqVFg3KpABpAMuCwIGLgIdBugGpAEBDwQObGINDJQiDgMJCA8IWgSME8oCAQEBBSUFAssBAYgQhQETCgJZAQDM02W3D2NTGEzQJIrFhTUBingxjJ9UzKtfN5lhYvHIkEh6fqJLa8U8PHvd94nN+J0hr+9UF3Gnymr3tl/NVq4Q5xqiHoOr6nqxT3vZyNs7jJBy95Dov+GmIjP8MHtqKfjy2T05NjAHuTxIzY/JcprpD4C6Ktr+iDRXypkywfq/kKIvKtwT83QGQlSiUl4rENg1wric6k3XuwFWAUdgbpOt/fzC7ZmRj+9U7ecbO7YuqQbmJ4xgPiICeLLhtKfZM8WC+11xcpMhfLeVKj7bFRbBPKirjjyh9+0uqotl3+kSoja6YKL/4Whsex1zbuv1VFTj1VBW6ui061zuHzR6eH3vRwEAAEANoAAAAAAAAgAAAA9mbGFncGFjay0wMS5zdmcAAAAPZmxhZ3BhY2stMDIuc3Zn/////wAAAAIAAABAEAEQEEAAAAEAQAAAEQABAAAEAEEEQQAREBAAUAAABFQAAAAQBQRQQQABFQRAQBAEAQEAQAQQAAAABRABEBBEAAAAAAA=";

const chunks = {
  "flagpack-01.svg": new URL("./flagpack-01.svg", import.meta.url).href,
  "flagpack-02.svg": new URL("./flagpack-02.svg", import.meta.url).href
};

register('flagpack', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
