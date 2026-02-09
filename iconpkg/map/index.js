
import { register } from '../core.js';

const lookup = "AAAA84kYpxgiGlsXMx5RiCd3NFVhN1NGNFSYI2VWJWNYJMIC/QRTAU/cAQMDCQK2AXIEJjEJAgEBFNUL4yIODhoJBgIDAwJYp5DxPlF3vLEIGYWsCNbsCgYH7/Dt/oIcu5fix0/kXsysn2T5BUnN/yGxohlpCtUTjSj3Uzi29YFAqP8hgQHwSKW3mp+d5U0Bqxkg7CLYHJ5UHlMltglHwOt4kLaEszq1L53HSz5kR6kEzZmBRhE0KWw4eReMQITKd858i2fk4xDvW7R7lKrIJT3dN3xEdaq8+xGLwyEspnMpgSR/t8GWWjc6S+9T0RmzRQAkAAMAAAAAAAEAAAAKbWFwLTAxLnN2Z/////8AAAABAAAAFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "map-01.svg": new URL("./map-01.svg", import.meta.url).href
};

register('map', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
