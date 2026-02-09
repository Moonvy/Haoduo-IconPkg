
import { register } from '../core.js';

const lookup = "AAABBYkYthglGn/NSLRTVmWCdVV3RCpUhIJThGNzZTEjBFglBiwUNeUNDE8aEvkBBwgCwBoELwcBAdwBFgajBgM4AdsCF38MAQJYtrUEIVd+2mQBoA2USuAnjul2PxQ6a2J9VQ9kBxitnw5FZv/W56VzwJr3V/h9XaIjM0sWwaScQKdT3L1+UwhhyeAesFjVbK38FgmUJokaSxwnFrvRe8vSxDgyH//sNxoASUom6TVtxf+JtygnNYH41+Bjb/R9zo/glyZUVJYymJAZLCglH0ZFaV/Vu6abvJrlvDDpiVeGoXLIXmIeZGHaZTg0e4uV1WI6IdAcmLBR9lzhN3kTk1sURRAAQQANAAAAAAEAAAAMY3VpZGEtMDEuc3Zn/////wAAAAEAAAAXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "cuida-01.svg": new URL("./cuida-01.svg", import.meta.url).href
};

register('cuida', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
