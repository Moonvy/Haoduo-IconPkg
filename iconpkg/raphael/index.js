
import { register } from '../core.js';

const lookup = "AAABeIkZAQoYNhpg8QDaWBtGtUQlM1FxRVVINFNVWUg1NUklaEhiWERnU3RYNw0GCdgMBg8BBw8RBwMsHoECAgIDFCgWlg8P4gIHDgURASUDFwP9BA6oAgKhAc8CAQENI0wGD3UCWQEKrURHOdu8x0JDcR4YhwapjAoOIb2DmF7wVgtuAKYpUtDKdtddV2LfgC0bfzxFq857lA7GLDg0ZUhbJgddMnS0J110RZblHb27bTCBxscToAcsvjJz4flYwd7XnlMraoeqObefooFd1/3F7qERu4fr+xBC2CmVQ4AwBwWpvrRWU+QMQmlNPArRXbNwsK6oXN/zAspz1qRnUC1bG7MHDKpZm6a+sp5DrZYisEC5mrFC5xxYQhYp6+L5OCXLp3r5v85+uwyIfr7x+hx/Tpaopm878kRMlIPwF/mHWOPuGx4slRK09J2AXeh1w/tvB8vX+Qfz4drXqrBSG+9T+WDqRkFmcqcVsz8UpImmW6hHkBQgAAACBAAAAAACAAAADnJhcGhhZWwtMDEuc3ZnAAAADnJhcGhhZWwtMDIuc3Zn/////wAAAAIAAABDBEBBEEBRQAAUEABAABAABAAAAARBAAAAEABARQQAVUABBBERAQQAAAEURQBAAABQAEABEQAQAEEAAEQVUAQUAAAEAQAAAAA=";

const chunks = {
  "raphael-01.svg": new URL("./raphael-01.svg", import.meta.url).href,
  "raphael-02.svg": new URL("./raphael-02.svg", import.meta.url).href
};

register('raphael', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
