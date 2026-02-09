
import { register } from '../core.js';

const lookup = "AAABH4kYyBgoGsGyoz5Ud0hlSEdyVDMYZkIztGhDQ4R0MzhYLDr6AosGCBHLAcoCCaoBCgEFBh0DCKoKExUIAcIVLm0CBg4RNQKFAQMC9gcBAljIxMnVXdzJ9EXIpMsLniKHaeaA471HmR7UQ0P0h7NLDRJczq1TMqn5jh2VksoI5NqQy8usyZC/MOoPuwuiFlsgkf8/Go/wGYsHmSHa47IAzjrE3q6d3p4OCIeNFlSmAzDvHNDlbtAUNKsQW37P6TVdPK0TucSlNNWS03Em1+4qOyeVYwvgqZhLbuvthzr7lTGd5lo1+RJUszCrBPtTD0vOfGjmsh1D/xgqTEbkvNPOPM73TX6dXRtjTrtP3uMdtyccUGLcIc78z5xFAADSQAAAAAAAAQAAAAp3cGYtMDEuc3Zn/////wAAAAEAAAAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "wpf-01.svg": new URL("./wpf-01.svg", import.meta.url).href
};

register('wpf', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
