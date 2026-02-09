
import { register } from '../core.js';

const lookup = "AAAAzokYjBgcGp2sBxpOg4UVXDBjUnJCYnaFhGdYHggJA1QP2UgoAwOcAgQEWA0CONACrgIaqAEIStwBFQJYjCrHeoGVB4umfSCAxAEeB7MxFuzwxZmCn36KcesKBhBo76wgdrZdyS2+D8gGTDQHbGifyHPOcIynlZ9A2kajbNMkUmuUz7fjHR6w6NkseochRFCvFB7meWhT355gNG2Mg9fzuqml1xuB0v6sh+L32L+9gcrkbLowlTt1O2fS/f6+RHPiRhVxz8Y5xbVlRCBBAQAAAAAAAQAAAA1uaW1idXMtMDEuc3Zn/////wAAAAEAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "nimbus-01.svg": new URL("./nimbus-01.svg", import.meta.url).href
};

register('nimbus', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
