
import { register } from '../core.js';

const lookup = "AAACmokZAeMYYRrmkVSYWDFKmCVBVVhDBkIjMzJHdlRSVWRTZIdEdUeVUTVkRFeFlkJFgWJ6FGR2SlE3RkhjV3QLWGTgGwQW2ggRAw0OHw8CBWUBAQMGNyYR3gIVBQUmFBcHKwICIBSgAa4GBQUFxgIOCAShGAYIBwoUAZ0DDA+aBWLiBAIFhwEL/wJHiQFNAwNMErED4hsBHGkFKhHiBxkIMVMFCJFIAlkB48ufIaGBf1DoKY9PVSCUW2b32xDhdEfd1xmdRjov8bNpsEgIMZ84MuDyRRfjBbJk5OE8ymrgSG4pdHanPOv4Pxpy7MEZwNWsx4Xh3+63WZb/2DHS0+5XIjIRbIvYQezIQy5L+6gPr8k2jeg8sqzCDKsqTkOGyjToLRtffRYfPPL7+V41WnyHDfBkbSeeuK6saRJZBfYBhXsC8OaiL5/Jq8IiTULGElMTv39ypXrh1qLC+t2pkHi5Hl6oIDWHUXQLvBEdIzeBkRgCcafpsGcX3jGFkZ2o5oNdFntbY5XrE6r+ddF9Y9oMGEyJz5PvSTSXDpkZKVhXnW1xMmSNGGHwN64ClC1tWi7UDvfzoRGcLGSkTYGunbBHC4j0Sus6c+MpvOo+6Xr+Wg7GvxDyvwckEWgGym1UreGaI9/LP75Z4gsMauQSR4NdZ4XbZ29GwO/2MczOiBVpC8mfzadyxryTKr58DzCxPRbDzjKrAYSFj1jFtgfsRBSc6iQGR+yID5PiH5pXlSXPxdm4oQ2Hqf0wWsFhuvy3TfcpRDOWXe/MRG0IlGBYcWycA+lVgfDEI2m572Mx4gqQjD5sftfTqraOOK2US8lou+ar8zacGygzEJAH/HiQFMzGG0UHhQmPCJPPo8EJcE1ggMkAAAAkAFAIBEAAAAAAAAMAAAAbY3J5cHRvY3VycmVuY3ktY29sb3ItMDEuc3ZnAAAAG2NyeXB0b2N1cnJlbmN5LWNvbG9yLTAyLnN2ZwAAABtjcnlwdG9jdXJyZW5jeS1jb2xvci0wMy5zdmf/////AAAAAgAAAHlGZkAFCUSAWFQUAJFVlAFRUEEURZBQSFREGIVSlBpBoUkCYRURIllEhABVFQEBSJEglVSEAmgaQBURARABVZQSYKQIESEmUpRQFhAKFUREVaJQUFAgSkFQACoJQQRBYZRECoUahFFAZEVGVlkgZVZhYiYEQUiGCAUVAAAAAA==";

const chunks = {
  "cryptocurrency-color-01.svg": new URL("./cryptocurrency-color-01.svg", import.meta.url).href,
  "cryptocurrency-color-02.svg": new URL("./cryptocurrency-color-02.svg", import.meta.url).href,
  "cryptocurrency-color-03.svg": new URL("./cryptocurrency-color-03.svg", import.meta.url).href
};

register('cryptocurrency-color', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
