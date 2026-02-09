
import { register } from '../core.js';

const lookup = "AAAATokYLgoazSiSv0UWV0Qnc0kXhAIDARUHBzoCWC4n6m4ERuKA8l7mjw/F2fWNmV77hU0r3ssjSFa8S0jJWm6K8+IMq2gKrA2TOe7OQoIAAAAAAAEAAAATc3ZnLXNwaW5uZXJzLTAxLnN2Z/////8AAAABAAAABgAAAAAAAAAAAAA=";

const chunks = {
  "svg-spinners-01.svg": new URL("./svg-spinners-01.svg", import.meta.url).href
};

register('svg-spinners', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
