
import { register } from '../core.js';

const lookup = "AAABcokZAQYYNRpVnQcnWBuChnpXE2c4VEQlKXU0NUIzVERWdHSGcoN2JQNYNdIDI6oDtQFD9wEH1QFSLgQECDG4GQg0ZxgEDwQHAwMFCholJQQF3AEKMAwUBIkBBVoFRwIDAlkBBil0QBEhHeSvct+VFPfm5RF1wT52IL0/Emm1p6TxTQyp8+0yhZe/syxQAldRPCruHHrC5TU+hW798ra6U4ClLXYsFywkYHAcrWDQlNx1OwvK478nHe20oyJMr2ckvtW3f3Wym/x3fgoHkg+lMOumGY/Baxtp7LMWvkapAmCpFT6vbCZu1h0PSJZVuEnQv75OekqpXaPkv7B7vdZQDM8D4iHRNmwH3kqto94tf6HLJf47Gk44HKBoMrqdH6x69nPSa5iou0fVAUw4uznXbOse1Xt7DAqBg4wwFp2JP/fA5KPRq0gwX7NWnJCilvlHaMNxBlXzVbksn33KlSIibSrqDYXjJg8VU5hHgSIKgAAACAAAAAACAAAADGNoYXJtLTAxLnN2ZwAAAAxjaGFybS0wMi5zdmf/////AAAAAgAAAEIQEAQBAAQEQEEAAAUERAAEEAEAEAEAEEBFRAAUAAREAQARAABQAQEQQFBEAABAAQAEAAAAAAEBQAVBBAQAFBAQRAAAAAAA";

const chunks = {
  "charm-01.svg": new URL("./charm-01.svg", import.meta.url).href,
  "charm-02.svg": new URL("./charm-02.svg", import.meta.url).href
};

register('charm', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
