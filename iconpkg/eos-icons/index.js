
import { register } from '../core.js';

const lookup = "AAABZIkY/RgzGmpPIRFYGjZ3NZYzNJZGZRJHlUIUeHdIYXQmg2YyM4YEWDMhBtwBEBkBIMcPAgIEf5wBNwwdIx4dwwQBAwW0BQUH5ALwAScPDEYBBPYKMkEKBBXzAQ4CWP0TlJuGsENU/3e9nFWj5QWfISJJj8lG9tr4AboeYR9z4AwO5dtig5/tF3takSFRzKyh5jWr9ITdIVkoR5WoK3ewXnulpC6fUlZ/rc6C+2z0SeAUXp+mQJn6sqnjK0s73yokTPy3TRrS+x/vV18GXDIE1xNBNuEwqoPFE3CiWi790Yoizqk9CjMySHWGN3ZQLyS1HOzYT7OO/3Dvo4pi2FMVxgL9m/q3vP6di4Q7dwmkubd7GMI4JFcopIVed8BtXj5/ZrkXVrLXMJaqp6f0EjWD9d6O+943/PdQ3hImzaDpVvU61zzAdpqo7fV58EMk5L/zJ3PsVJzCuSm6TgCLRwABLAiEkAAAAAAAAgAAABBlb3MtaWNvbnMtMDEuc3ZnAAAAEGVvcy1pY29ucy0wMi5zdmf/////AAAAAgAAAEABQVAAABBAFAQQBAAAAEAREEAAARAFAQAAAVAQAEEAEEBBAAAAABQBAAEAEAQAQAAUAQAEAQARFAAAQABEQAEAAAAAAA==";

const chunks = {
  "eos-icons-01.svg": new URL("./eos-icons-01.svg", import.meta.url).href,
  "eos-icons-02.svg": new URL("./eos-icons-02.svg", import.meta.url).href
};

register('eos-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
