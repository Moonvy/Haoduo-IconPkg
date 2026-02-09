
import { register } from '../core.js';

const lookup = "AAABe4kZAQoYNhpAg7sFWBtTVphXQkZ0SGSFeWNFRGREcXNzFHMkRzQyd0ZYOjMpCrcBwA4PBQIFGweLAckDEgkT/gOmC5oCBQELBQUYHSkOFeUCB2ECbwf5AQMDhQEJDAEDARgLMgcCWQEKCwWADiGwXXFEHCxSWH/KUFbi5JaIuQwy7ptDQr7edHP9g1jwG16tDEUYPHsig0UspFwHvlOUJxc8q+uUFCZixUeVW/mWtJq+0UQT8SspsH5yshGd76aqLXRCHnWA4c75tLPGCui0BsOBGzBqQhtNdrFuQte7OLzYXRWHTuGHc13GZ0hYwRCkreUO+Zg5UqlvqGmmMtY5lZZdXaa3HflwB4CHDKl6B/OeKTC9AuMWzoE4qqefQb5CLcqo+/q919dtRqIS8EC7++pmh28pU8vL0H/uLAoHXdfaYKrHjOvz3z9DoLPXHDTbsEOufhvfoQeo9ABWxwdliVtXprO/W1mnUyXnnrtM8vk7+R5HARACAMEAAAAAAAACAAAADnJhcGhhZWwtMDEuc3ZnAAAADnJhcGhhZWwtMDIuc3Zn/////wAAAAIAAABDBARUABAAQEBEFEQAEQAAAEAQFFQQAAEQQAAAQEABAAQEAABQEEAQBFAAQABAFBABEAEAEAEQBRBAAAFBBAUQAQBQBAAAAAA=";

const chunks = {
  "raphael-01.svg": new URL("./raphael-01.svg", import.meta.url).href,
  "raphael-02.svg": new URL("./raphael-02.svg", import.meta.url).href
};

register('raphael', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
