
import { register } from '../core.js';

const lookup = "AAAAbIkYRQ4aPyYhSEdjpUgUZ1UyTnkDnw3sAwQCOgsHCgIHAlhFh7jiwKPlOTkr/1UZOi2JdhPmxSlAg+zuo8MLUay0eSfbha9MyA6yDn0/kwl9u0DlpY5/5Ocq+W0VYRJ1KqbIBc2lwRAFQoEAAAAAAAEAAAAPbm9uaWNvbnMtMDEuc3Zn/////wAAAAEAAAAJAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "nonicons-01.svg": new URL("./nonicons-01.svg", import.meta.url).href
};

register('nonicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
