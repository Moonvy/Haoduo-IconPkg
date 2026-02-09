
import { register } from '../core.js';

const lookup = "AAAAnYkYZhUaEkYaGkszhoMyWWVTRjlEA1gYBLwB2wMBxgkG2gMPFnoBFR8EwBsMIgMGAlhmMCyWJ52+DM8eYKtQG76MUCce/df0unNpv9KDcw4+ozKHUyOnDrqBB3+9KkpnACzzWPR7zNesbZamRMet97OfXGWsMIJ1OET+JJXHukZSaL3f95VDOB4Lnbm/oBHPh04Ufhu+aQMMQ0IAAAAAAAABAAAAD2J5dGVzaXplLTAxLnN2Z/////8AAAABAAAADQAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "bytesize-01.svg": new URL("./bytesize-01.svg", import.meta.url).href
};

register('bytesize', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
