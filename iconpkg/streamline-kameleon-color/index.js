
import { register } from '../core.js';

const lookup = "AAACKYkZAZAYUBpzT4QqWChmFFdyF5lzN1NktFc2VHShZhV3RISBg0lWFHYjQlZWYTd3JUZVRUVTWFJ4EN8BHwOGAZELsAQCOQIEOwYiFoTHAQgZugMCCgk/vBlIFQZIpAMIBLwB3gICNfMGGA4BXXwFAQgIzgEEgAGLASvbAwFingQCBwkvDAIoBwcCAlkBkGvleAusMxCybfbX9FEorPVRfaLAlmjRkja7R/tyGPRUv4nWrs+fk3t526ewGuafr23PQnHZ5f/42ANDA0ySNelx9ckknB5WzFuE8FbasRIdJiJlDgB/U/vXlmFFJly9EO3MC9hto1ORk610ndLUWTsGQ8nEQx1yBpBhJ2PdSg9OHEyiNnkcFw966Ksx20GtdSRYYhMKNqYwwFcjZ0FN79/NyMfKhgxPrKDhmibaqpYdJ0VuPDHbqI21es1UWg3o8HOLcfuX5chN6RLnvkU0016pcpOGCo1cVDA0xCMq/sDp/0eKOV/61604WXBUPszIJ13P9Tox1SXLhrRdtVG1DDIPD9u7wyUt3rdLTFjB7vX56Qk+L2W06oS0m4knpPGiVaJaUHkEcFFTFUlgFuCMsdwVJvKhfMVYP+hpf+LUPnDWoDMKubFG9yUFHRZUd0vs4BZ6jKimdiwm0XMeGET438tyT9TmQTKsb5R6jISLgSkdKZzMBw0nKJ1v25Ncbk19uYS2H2Fc8K/COeZqakMJD+pKTEIAREiECEAwAAAAAAACAAAAIHN0cmVhbWxpbmUta2FtZWxlb24tY29sb3ItMDEuc3ZnAAAAIHN0cmVhbWxpbmUta2FtZWxlb24tY29sb3ItMDIuc3Zn/////wAAAAIAAABkEERFARUUAUBBERFBQUQAVVFQUEQFVAVAREUVQBEEAUVFQQEAVARURFBRVRRVFBEUAUQRAQBFFUBRRVBUBREFVFEBAAAFVVQVBVRAAEEUURUVFEQAFFUFUBUVEQAEARQBEQQRQAAAAAA=";

const chunks = {
  "streamline-kameleon-color-01.svg": new URL("./streamline-kameleon-color-01.svg", import.meta.url).href,
  "streamline-kameleon-color-02.svg": new URL("./streamline-kameleon-color-02.svg", import.meta.url).href
};

register('streamline-kameleon-color', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
