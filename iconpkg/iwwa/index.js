
import { register } from '../core.js';

const lookup = "AAAAnokYaRUazZQBmktUhHRkJnV1hVQVA1cGIAi6BwQ8MSPcAQkRCJoBEbICHncGCAJYaTOtKYcApWAwUmcsm3gA1zrl5CxlBwK+36e8G85waRM5awv2U1ogX1DcgQf9/oLX66695rVnpppObTRe1WmJCseVAuyEK78qzX6gbeFL0YYe5drHSoFd8r7XaGxEH5BIiBAVrpz7RoKDOkMAAggAAAAAAQAAAAtpd3dhLTAxLnN2Z/////8AAAABAAAADgAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "iwwa-01.svg": new URL("./iwwa-01.svg", import.meta.url).href
};

register('iwwa', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
