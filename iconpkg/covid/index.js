
import { register } from '../core.js';

const lookup = "AAAA0IkYjhgdGmObd4NPFEdYZoeGIzRSRGREVIYEWB0SKwSQAzFGK0qiBCS/BAEDBQoSByUBBgk7igEMDQJYjum8NQFcMl+aeErFB6iT2/yxeVYpui5+SY6VuWPB7JExMXgrsjjqMwfqTnJKo7jYQ7AAiYuCiW05VZ4/2aoT1GoPFj7b4QbyYdTyJiiaVn4ewZk/i0Qm7TFXngkhw47+8y/LatOoCbauopc/J19l652JM3lX91rAiweZCjDoHTkF6ub7B5Fcp+2PVDBe3ppEAmABAAAAAAABAAAADGNvdmlkLTAxLnN2Z/////8AAAABAAAAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "covid-01.svg": new URL("./covid-01.svg", import.meta.url).href
};

register('covid', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
