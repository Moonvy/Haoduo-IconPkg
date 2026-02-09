
import { register } from '../core.js';

const lookup = "AAACookZAeYYYhooqC8dWDF2aFRnSBSFUUa0RFJDV6KCdINlEkY8NURkNJg0mEmSWFNTMxlVVEBUSGZFVFBWU1M3WGlliAGhAl4GHoYDHJsDAQISNAwRHgqjwQEEBBICCnIHBfsNBIMBCD8DoQMGAnswwPQBB0QFCAsFIRAD7wHKCgMEMs0G+wcIgg/GBiUFIgIJArIENRAEFgsBOQGnAwIMBQMJAxgdBAIKKgMCWQHmWvzme+jcQXKQu92+6MfD5xPdvqI5N901fshrbeb021A+RMF2EWlp/IwuPR+6ziULuT94Wpsb90Zq+/MAftixlWOT6jk8g3sD/nPiUpjKiq2UXZBLZL97ctnH6lzN3oc/wbWLf26RC8MEbRWASbuUxh3/NByj00fulQwgb1eQDFB0VSRMgRcMYND4ZMUl8DTst2zpWdoqzseQMHsyR6mczGX+zWCvCtL95tfKYR72M1I6RMXeZ8LLTZf3JHdK0yCBRvYxirCocAmcHQ3eJ3On+TEzxwCIC2dfnWRw4D08FrHmsoMCFDFAyUtEzRbRgoKlk2NVHqihpwnVIFiVzVQzDG/IjL8lLb6R0GMST9h1X3km7p4MvikGiPa39ZywdUx1cCAnqj7UMKYsh7MyTvznp9nzsYxo+TeQBZXvoWmFNrDmD/02ieRRyPbxyI4s46VTt8iWHzDrnAjFbM6mNwEO+a4HynBUPnwXz2BzBRid+TCH4WYeaktsqZX38q+/3VWpa/MdO62s8mhxaMvs56b9lEEGF5ikkiKrikGpGHbDNYOGtSfySoIBThdLRFqf2ftz+f9pT8AR3yAcwYLKOywxFsJ6SnH4MB3zjB/loSYKn4ZgQAob5KizApNTlRvP1rCUbqwe+oyQTQBIIADAAAAQkJAAEQAAAAAAAwAAABRwaXhlbGFydGljb25zLTAxLnN2ZwAAABRwaXhlbGFydGljb25zLTAyLnN2ZwAAABRwaXhlbGFydGljb25zLTAzLnN2Z/////8AAAACAAAAekpVIRmYBCUGCIBEGVQEQhRUUZkAZUZVQUSKAUREUFVAQVCAVWQZhWmSIQUJAEiUAAhZaliRIkYCQhFJEUVmCWAVIVWIphAgBAaBQUFmRBBUERVFFSUFEahShUQSEIiBgWEiUVIQBSWgElFGIBAgFCYEVFVhRFFBSSEBAAAAAA==";

const chunks = {
  "pixelarticons-01.svg": new URL("./pixelarticons-01.svg", import.meta.url).href,
  "pixelarticons-02.svg": new URL("./pixelarticons-02.svg", import.meta.url).href,
  "pixelarticons-03.svg": new URL("./pixelarticons-03.svg", import.meta.url).href
};

register('pixelarticons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
