
import { register } from '../core.js';

const lookup = "AAAA0okYkBgdGsBJ2EhPFFRFc3VhiFMmGkZFSFYHWB0IAh4VF3gCO84BJoYCAwoT8ioMHgQJ/wECbwm6AQJYkNReEEkuckgw4WIXN0XSC3ksOVPwBhIzVyGDZIpjt9ilnyKwCKFQ/34nkMr1Raafj1/6htcmKMv+IEcibuQ4jOpoPeJZ1Xtj/DuXkWPgXQZbXC7fay0h0rGZ/UaXBjq7+ZVx5Q9vjLXyvy3A+6/LamGNbsEGBA59irGGMtPORmvks2WuhuFU0AIf+2VDccbaIERCBAoAAAAAAAEAAAATbWVkaWNhbC1pY29uLTAxLnN2Z/////8AAAABAAAAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "medical-icon-01.svg": new URL("./medical-icon-01.svg", import.meta.url).href
};

register('medical-icon', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
