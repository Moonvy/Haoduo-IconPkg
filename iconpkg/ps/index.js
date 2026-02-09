
import { register } from '../core.js';

const lookup = "AAAClIkZAd8YYBqu1RsAWDA0hmZDZ0MlQzREhBYzMlVBh0I0N2VEOkl0JChYE1U5oyhjOHdEeIVWdmSUpGplFVRYZBgHkAGeCBdwAgzSAxYGDAgSAwkFgQFzAQEFMAWOAoMHEAsQRgYGWwEGrhePBAcZ7gEGAdoGZQ4GHAWABQWQB8cCAQNHjwYMMQMehAMnBqwEDQEyMA9KDIcEB/sCuyoQFgYBCggCWQHf9ZwjgyEX8rZFYT5XfO/5HvJG+RG5WF34tIOaBNNEa0Y8Sat8URpBbz0nFSoUEDuN/Rw+qX9Do/+t8UZHDkN+SAqc0DxtAsNWM4HyviYtOvdeogyBL55BWP/yp3Xvt26bqwt0XzomRdfvG06QAfcRW3qMo+tRXZOk5/o3dDO3uKLWwI6A5E4upyoCpJvYlbAdOzkj03WpRHMS94W4FmcihwWzRDP7sFMd5mXK8IPaUhQdSuPIvncI+Xe+akevKr7RqSmf0WkkiLzAzn+52+LFLG9n3YzEjWZhU5RxgKFl0qGcxwV1hVwIzU1XdkVrU/75BpEGFPh1nWBvv4oEB2dbYVFFjGi3Np/DOyQlkZRQbsBh4pVtUqrs0exPzVIuE7WbWIYcH/4TmJvTaHVLK52nG6OYz3i/RdYG4gJz5qpNuCD7aefNib6A7ornHOaJcFWnBAETssu2H9rqArOkzxSeEegvoMoz3vMdoh1nuRSQL22NMl1M2jkh/XYL0GxxXbOVwIv70hcC8P0/rciz2SyDLgxIWsTiMvRv05zpNrsdSxwwitclITKMPABjU46NkgKuiMwShih2xoPurHpnNSb5MD9+NiFxJ1anV8Y//q/09I/fT7qs3/9vXMLpmTdCdxJMAGCJRgQgICIgAAAgAAAAAAMAAAAJcHMtMDEuc3ZnAAAACXBzLTAyLnN2ZwAAAAlwcy0wMy5zdmf/////AAAAAgAAAHhBQQCVEWAhSFWIASGAURRhQVglBQlVQQkYVFQIFGkGQEgSVEAGqZgUSoAGFUBQRApBQGFECQQkkRpFIFUJKBgJVlUFEVWYglhBVBCYApERRVFRWBoQFRRRRIQEEVQaZRRUClkAQUAlIWClkUolkJUBWYRQEgQARBkAAAAA";

const chunks = {
  "ps-01.svg": new URL("./ps-01.svg", import.meta.url).href,
  "ps-02.svg": new URL("./ps-02.svg", import.meta.url).href,
  "ps-03.svg": new URL("./ps-03.svg", import.meta.url).href
};

register('ps', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
