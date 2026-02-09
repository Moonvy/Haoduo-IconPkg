
import { register } from '../core.js';

const lookup = "AAAAf4kYVBEaGt5sOUk0VWVVY6OFMwVPFyQPByEJARAClQIISQQmAlhU2TG5Ff2nJL7+c34wsQ34K/gtm6DzbfOilQHTQb0eGDI6DjM0f3VOvfhSh2k5rZgbKXnIpv/p8YxffqK0MCzyjBj+P/A2rFtgHWC1Qv7f8my6PYoZQwNAAAAAAAABAAAACWlsLTAxLnN2Z/////8AAAABAAAACwAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "il-01.svg": new URL("./il-01.svg", import.meta.url).href
};

register('il', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
