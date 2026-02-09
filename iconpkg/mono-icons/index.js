
import { register } from '../core.js';

const lookup = "AAAA/okYtBgkGp/ZXGpSdyRkVVVGVXaFQ1JWY0ZTdlVyWCEbRAQBD3cIGAZnBBINGj5RcwU9vAESA3wCBA+yARFZVT8CWLSK+IfnqaKSyaw4znXmFAmWnR3ZsDIezroCqV3PYJcKG94eMC5S/z/OU3by00YRRh1o91daYBhpkAHPG7WuWIxQzwKsP7+3l8qfHpIOvlbz5nvW5LyZo18k4QOtbMXclRYQk8S9xW0XGBVrjJVpBek8e++w/desNvTQSnyULZ7FM7VzW1H32in5YjvQfviwJKefujSm/SzDmNI27WCBrdzXnSIHF/7yc4C+LFN/leEpn75bJRVFAAAVAQQAAAAAAQAAABFtb25vLWljb25zLTAxLnN2Z/////8AAAABAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "mono-icons-01.svg": new URL("./mono-icons-01.svg", import.meta.url).href
};

register('mono-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
