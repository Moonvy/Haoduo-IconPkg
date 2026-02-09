
import { register } from '../core.js';

const lookup = "AAABD4kYvhgmGgDnElJTUicmSYQpZXVTU0cWSVdnQ1RVNlgnAQhK+wEBrR0PoALACx96FK8BDQUGPx6pDxa4AQyGAQMCBRMIESICAli+joHkYQlIepqLxgf38OmDh838WWOd3HkRlQQkjREgK6C94/gRdMeHtpGRtmkRPlB+DaXF/9WYQgd/5iNNMZcHL+hghrl4VpXGwg9VveSr8fOPWPKVdtcWozNUe0TXsn3N3EMbbJ8OHgNv84uBnTV/oBsFKnJg2am+AXFAbcBxWL1c03uRnomnPIJVyu9KKlu/7/Z7WkGDOvPXLTyscGtk6COLzhEV1x7LySaju5nLEZtTFdJQYCVjyWzvfi6sOEUICaEAIAAAAAABAAAACnVpcy0wMS5zdmf/////AAAAAQAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "uis-01.svg": new URL("./uis-01.svg", import.meta.url).href
};

register('uis', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
