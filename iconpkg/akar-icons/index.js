
import { register } from '../core.js';

const lookup = "AAACfYkZAcoYXBr3k4/FWC5qdjgmg4QiM5hEh1hiNlRpdUNlakRFgpdVNCUYRGYiIkJ4QWN1NEBzZjN2JYk3WGTjNQVsJbwBBFoBBdMCATcCAQWYAbINAwgI6wIbBgUEIwIXDtMLBwZGBAsuH/QKBxACAxkDwQGiA7UFQxYcAwIBnwICFT4wAQTAAQsBBQgObAMTIQNFCq0BB0L/AwUBzwWLAWECAlkBynBis0SxFazLKIxvfZzZffnTqTCvleIvRHASJ57WdMB5v4wzsTSwh9T0gfNHQjpEQKUXYm7CPz191mseUpkX0/QRD0ZVlWDHAzvkTlWS8l5T/JgmSIGuqSSnxeaCWEm5QGnuySzcaQOJbAt3fblPP+Myyz7Tp4A6MTmK4neUy13DML9sGWkYlSFf5/WeYDCUebmVnK4XWfkHp2+Wc9l2VBp8+OVtW19+43x/f2zXFRIaEefxk4chRJEgVR4kuZ5592keSDPJwMMsvrvIdYwCtveMcL2BbT42XF+bPQX5psWdVLJCBRxhDct+rCW0H8IeqvO+irU1dm0HwPmbYV2/vBQxDqlpvsC7hZT26Vj/RTZ36GzIxeQwdRGQDSoxHZzR1nrYEZHQoe7okB7Fs2GwIwk8TB3WwQLYCa0hNycwZeYinQd4bnHHGDZQ42zuuVQdQdmUl1xlusoIvb8yZoT+QScQqwXtPjzzlAdgJjrmuWuqG41JhSKE5uUm0nfrAHXsByyozTftlIaDHCrRRqicp5K+GrEX+TZzOxgpce/4UB87YnWIoC/3FKwiz2Pvbt+gsF4XXnJ+XXUZ8/QhlWvMrdKENsjGlZo0tq22TAAgAAAAAIDwEBAEAAAAAAADAAAAEWFrYXItaWNvbnMtMDEuc3ZnAAAAEWFrYXItaWNvbnMtMDIuc3ZnAAAAEWFrYXItaWNvbnMtMDMuc3Zn/////wAAAAIAAABzEBIQIZiREoQAEEUakBlEQYAQGQBAJBQVFEVAERUCVAGUYFRWQUQpEVAlFQYVEQFUERSURYVUUKUFkBEAQUQIBhFkZQUhIhBGZVFJEFZoBFUlVRiAEgRIBQQYQEWBVUFlFQRklhBQSUEBpQIUERgYVQVJBQAAAAA=";

const chunks = {
  "akar-icons-01.svg": new URL("./akar-icons-01.svg", import.meta.url).href,
  "akar-icons-02.svg": new URL("./akar-icons-02.svg", import.meta.url).href,
  "akar-icons-03.svg": new URL("./akar-icons-03.svg", import.meta.url).href
};

register('akar-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
