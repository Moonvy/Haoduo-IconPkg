
import { register } from '../core.js';

const lookup = "AAABf4kZARAYNxrkUt4JWBxVhVJ0e1olUjJjRjplQ1JmR6YkFWJUZYFGZjUEWDdCHpQBDAeyAa8YGJcBJg8BCgMBEwMbggYBGSUDCAEKICJ1FAr6BQtGcQIfIlDxAjkFiwEVBQQDAlkBEKxJ0A/mB9lplNKWHDKEsXU5U/OW0+8k3lkCz4V3i1Xa53C8P79IzKKpXY7pzfTx5pW87MvioYoTSL9hcqvgrwpt/tAbLPFKWPPSsCc9vhmYT81r44dF2l52iS3rp9u+hha+5KJaCv3yjtQGYHpEu0TlujzygJOCIQesIDtBHSbt8SfTdGsDgWmidN1qcSd/tl2o5b/yCXDLp9GWpKcbc4QrfNVxr32bCZ43hYwMJU0KsEoE3C4IErni7IcDYA8ngkN7rSselSt2quSzPpU0HuTLWWIx/xiLj1W4EnAcqvFz/X6MldatJHTn7Bb0ra+bP8X4ayqb/5xSoLV+2yRa14oXZwslCNSmpwS/0IFjnse9RxIgBACgQQAAAAAAAgAAABJmYTctcmVndWxhci0wMS5zdmcAAAASZmE3LXJlZ3VsYXItMDIuc3Zn/////wAAAAIAAABEAAQQBAAABBABBFVQAQBBBQQEUARQQAUEQEBABQBQFAAAABBAEUBUBBBAEQBAUQQEAAEQBAEBQAAAAABEBUAQAABAAAUAAAAA";

const chunks = {
  "fa7-regular-01.svg": new URL("./fa7-regular-01.svg", import.meta.url).href,
  "fa7-regular-02.svg": new URL("./fa7-regular-02.svg", import.meta.url).href
};

register('fa7-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
