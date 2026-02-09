
import { register } from '../core.js';

const lookup = "AAABKIkY0hgqGg8Y5HlVRWVlYzUzcyRCFidJJkSYRGm0WRVZWCkgAhQ7F1gCCxQIEkYBAZkBL6QKDBEYCiSEBAMCtAoGJf4N1gIcB9AJHgJY0jPOv4keEqjMUvRfMuaW2TD9tuzQsvzDBHFSlbmLAqe5JEfl+hW9doIGka3XQxUIZdYJPKC+xr4fV4JSdu3OHdy25+iwHA35dHv5BcuE0YDVclB/YP2SbQMNuiC0HpUCbCECbfIkkCkunxTsfFDPAiwZrTYV/QlCa9f9AVbtMfInen9pt3pEtQ9wy94BrCeR7DIQQvTZcoCtHRXcz05ojCk0lfRW8uKj8wkyVD6r3Mg/OcjlB2IktWxnVVZyWWiGP2m6dTa6fF1zKzHxG8G5goHk1kYAjCkCgAAAAAAAAgAAABJyaXZldC1pY29ucy0wMS5zdmcAAAAScml2ZXQtaWNvbnMtMDIuc3Zn/////wAAAAIAAAA1ABAABAAAAAAAAAAAAAAAAAAAAAAAAEAQAAAAAAAEAAAAAAAAEAAAAAQQAAAAAAAAAAABAAQAAAAA";

const chunks = {
  "rivet-icons-01.svg": new URL("./rivet-icons-01.svg", import.meta.url).href,
  "rivet-icons-02.svg": new URL("./rivet-icons-02.svg", import.meta.url).href
};

register('rivet-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
