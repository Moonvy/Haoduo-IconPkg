
import { register } from '../core.js';

const lookup = "AAABqokZATIYPhof3oP5WB81UmQWNWQmerViZJVzZjI1ZTMoUnV0VZdEVyJWY1JKWDw0AgEBCgwGBgMrAcQSpgEYCxWgASS8BgFxIDcBDQQJPwQCuAQEBSoL3AEFB74CjgcZA8IBKAFHAWUNGQYCWQEyQFe7wXn0Hr4Diyv8F2Q54eGlmTIpnJkd3QNpOHwPAJs920o0LAsK4DSxe448QDe91+U3ke4lfoPQ8QtkRN8wt1fDGp+C9J9s1HQ1gZ2KbN1onQLNrigMKs9xETeRXQ4tF4GUBxWVqtlgRHuNW9+s6uckOgT+OqSWsHoqX+8eDlxpioH7ov1QR1wjEy1Npv+YObgMb5U76YPRogf1sO7tlxMFDYfaQw3liFRDuCSg3cWv7Tvz4zhGLeysMLdEPyChjJcxi8VEhQH7oowaUGnapL/cmIKPQe5wW0fD1VamESy19Cio3etdxbzts3fPexQbCgKhZfagwzZtl7/aPZvTiTPEX2R5+e9pyglpbCLHWWvWY5DAuhZFJnFbfmfDGzQ9c6y/r8f/LffZ+4mrlL7aMv6USIADFBCgAKAEAAAAAAIAAAANc3Vid2F5LTAxLnN2ZwAAAA1zdWJ3YXktMDIuc3Zn/////wAAAAIAAABNQRQFQAAQARBBFQBFRAUAREFRAQARAEARQAEBFQFQBARAEEAUBFVRAAAQAEAEQAEBVARBAQRQURBFEBAAEUBAUUBRAAEEEBAUABEUAQAAAAAA";

const chunks = {
  "subway-01.svg": new URL("./subway-01.svg", import.meta.url).href,
  "subway-02.svg": new URL("./subway-02.svg", import.meta.url).href
};

register('subway', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
