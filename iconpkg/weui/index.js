
import { register } from '../core.js';

const lookup = "AAAA6YkYohghGly14ONRpUWGRUdAMyVCUVNqOFN1dAlYHwieBzoCFUA7ETkHAQtNAxEIJLcDHAkBMrcBCIIBnhACWKIrq4rwDqW9U7+B0NFexzhh25IBZGMhocm2JxCGgMsb0YKPb9OORvZDhtfi9FrcoVbOaaURYbSEyTQQm3fCulMzQE+y6ZLpAyRW5q/X/FUBQrFLdnuDJYPH96VfpHKSPmqw6zNssRQ4sKV0+7uXKp3Rfpq/kppvepjvC+w7RnbpzOcNfTcv48AJWBJGCUCLOsxzC0uNyrtuO6e0/RKeG+ijfwNFACQNEgAAAAAAAQAAAAt3ZXVpLTAxLnN2Z/////8AAAABAAAAFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "weui-01.svg": new URL("./weui-01.svg", import.meta.url).href
};

register('weui', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
