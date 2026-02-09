
import { register } from '../core.js';

const lookup = "AAAB+okZAW8YShrLm0pdWCWXFhRHV1Q2E4OVhCSkU0J4a0JWkzSDNmZWRVVEaGQkZTY0MUazWEcM0AYIC/wFCOkBEkEhBNcCCq0DmwsJygUEGOYEDfAGeQFoLzgWBwo4GgUrW7gCMgsEMREQGuACNQMSBgImJgEVBgEXAgLxFQJZAW9C5h9tzpBDf/zU9hXFIxcZW/3oA/m0MgmnfKLLi1BtqX5C+fMMh5+gkruioTG4f+q/w0dRw1DIhVtU0D8dcBPzujy/E6MuuEOvcnMk5kVgqipSv9EU2tkF4q0+xJWRQ8P/clstXJcL5F1ArlaGfdTzslk2GiqohIJVY9YhTfNOakRpk3zf8BcW1Es9ovSLwttQaEzAW+TuhUFQvFppqnizhu3boU+z/IzQeUhl3AcnIo2Gwnl23p6YbfQLzZe5ngAc7G8C5TPDqpOdpVxK97IC5lhcSkz1KRCl3wppU8J+foSfpFeFcfLcetAwYj8yZXFcuVFUNq6yk52gC5xqKvTPNX8CmtgorcYlt5VUHQOcc29ddgmtPwQietp+Htao63BiQsqirscBGdVs2rkismhN5wYMnJUN3LvHbC4xfNjlHJRI13sAPKt5RazEhvveXP6L5Ew7H3IC9wdfLNwmEDnUJUrcd3XMI6Pkh9hpGZ6vSiikkRVEAAAgEAAAAAAAAgAAAApnaXMtMDEuc3ZnAAAACmdpcy0wMi5zdmf/////AAAAAgAAAFwQERAAEAUEAREBAEAFRQARARAFFABUVERBFRUEFAFBAAVVUBAUQQRBRFVRAQFAUAQQQAVEAQUAEVFBAFVVQBFUARUVBUFUUBEUFBBQERAEEFVBFBVAQURFFUVQAQAAAAA=";

const chunks = {
  "gis-01.svg": new URL("./gis-01.svg", import.meta.url).href,
  "gis-02.svg": new URL("./gis-02.svg", import.meta.url).href
};

register('gis', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
