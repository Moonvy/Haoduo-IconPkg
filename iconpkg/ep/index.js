
import { register } from '../core.js';

const lookup = "AAABnIkZASUYOxqdVipuWB4kZnU1RVdGYWelY0dyZjlEM1QkZWd2glQmRjh0MQdYPBATNx6TARoaAccBERYiIw0G1BcEOGArAW4BKfUIHwENBgUkAQ24AUsFGjQBigcN1QECXPELCgOeAgb+AQJZASUHgxXI6W1L0EtfhiH0eqHTLvyPCR1ULRtRcGD5dHWnestgeLmDNl5a+9fKNAoVhCXEt/A8y3KesZ95Hs+Qcyb4tm25aUdnshnCCKXbVtSgWsdsoUKIf0/X06djn785gzlomZLf3NZJUj3l5rAzwedv82Hvr5SVp1v42X7H4vmhOI399J1onQ52OTsYrAbSoI1Y+BaKXKdkMu/GJruH/cC/V5kPfwAdsVuiNpvGK74UJxQXlAPKehGXuEqo9xvMyeVTu16t/nxp3lqm/ABWCknalUXyzlMTJaywB2/Z1OMqMM7qBrQClb30yOaHreFx2JZng6Ue0/sqvPJB2he1UEcScA3HedysdXLHBwF+MXUQjq5G/r0AG7AzFwmtEeQSaX9ztyy+CUiCYAAgEEAIAQAAAAACAAAACWVwLTAxLnN2ZwAAAAllcC0wMi5zdmf/////AAAAAgAAAEoQQQEAQEUEVQAFBBQAAQAEARAURQVRQAQQQQAQQBEQEEEQAVAEAAQAABQAQBQEEEVEBAQAAAAUAEFQBBBBAQABBVFABVABVAEEAAAAAAA=";

const chunks = {
  "ep-01.svg": new URL("./ep-01.svg", import.meta.url).href,
  "ep-02.svg": new URL("./ep-02.svg", import.meta.url).href
};

register('ep', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
