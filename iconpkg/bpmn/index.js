
import { register } from '../core.js';

const lookup = "AAAApokYcBcaDn6dmEw1J2SFZJNIdiRiMgZXUALiAgMFMBS5AQIhP/ECAg4TBAEDvgQCWHB6ReSnHaFDenaJ3weqpBNA+F4nA8wWRDwwW4ORCP1mxPg6nQviF9LC8vcmhrUA5x8lkEdqScQ9tkqSMd92CV4mbIf4OfLlV/CIUkjTNVSbe3eTygwGEf2tlcNElycdjICEPKcTpL+BseTvntQy5WVGQwAEFgAAAAABAAAAC2JwbW4tMDEuc3Zn/////wAAAAEAAAAOAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "bpmn-01.svg": new URL("./bpmn-01.svg", import.meta.url).href
};

register('bpmn', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
