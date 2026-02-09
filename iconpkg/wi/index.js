
import { register } from '../core.js';

const lookup = "AAABRYkY5hguGh8wFQVXaXaUGZImRDgidyY3Q0JVNaVmWSV1RGBYMBxTTCANnQ7fDKMDlAEBAwZ1AQTEAhoUiwMFBAIGDAgBCAjKMRlmhwMURAEtNAgBHgJY5n1ltqmqzWTRB9mdkO35ocp/epvJWoIQfoSNJJg5Vb9nDw54IhV/AvY/Dt1PP1kXQlByP/pXaDxrvnqpUI4u0tLLOBWy6YBMCmP8Jtyg19I9mo2NIH6y7cRzzfK/OteKF+EonFk4lXwEBh7lgzGJj0E4/3nNi/bqYeet7lwqDhC6al1llq+wvt4Y36hLLDbq7ga3sTieH63k/Ku3AqRb1jOTVgDYkhUi2HlHLMNBRthy1j2guiVhtxuw5Uuyrx9flGIqB7TuwXkyc6xdeBo+J/GnWznBjchJD0w8XEisVLV5MFXCTe+zRoABIQEAEAAAAAACAAAACXdpLTAxLnN2ZwAAAAl3aS0wMi5zdmf/////AAAAAgAAADoQAAFFAQAFEAAAEABAAAAAAABEAAAAAEAQAAAQBAEAAAAAEBAQAABABAAQAAAAAABAQAQQAAAAAUAAAAAAAA==";

const chunks = {
  "wi-01.svg": new URL("./wi-01.svg", import.meta.url).href,
  "wi-02.svg": new URL("./wi-02.svg", import.meta.url).href
};

register('wi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
