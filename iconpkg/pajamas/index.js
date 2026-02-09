
import { register } from '../core.js';

const lookup = "AAACOokZAZ4YUxp9L3NsWColOGRGJFRFJ0ZVFiKmc0NUR1UyQmgkg7U5FHWVdWWGR0NkRHhjN1S0SgNYUgzuCARCEBkCLRkTlwGDAQwPkwIImwMBWwIJAUQREVA/AwQCrwRVAgIBmQMZtRqBDQUGGgQbjQMRFAEHQBkLDgU7C/QBSAEYnwYDSgbBSqwOCAUCWQGeQtoyO0eVvb9hVn9Jmax1KlJ/qWbl9eMbVNq3cZPQ5U56agny9/ADLLBr0kTb1xcxvl1wv36+uV4HSs6meQG99oSY9w71eglr98rBp3dvGuHLuFDUb7CHn3cKlFKP7+Y5kupLWnotv9H08FJ+vnNeg/5BRxhObQ1HVKZ4naWiv50YnhnpHkZqVWgdgVhulCqTdvI7+lKTX5jua0cZKWxAj4yE9WjXxizLoWwggrbXAoy6g3bSHoVlKmdEjJ+TH6e/t4JhMdKbPU7lFc7BTLrmUMBJyzTnBsXXhxVUq1OXf6SSQhnsUzpt4hjCVLuAiYtg2g6YwngpnxKLdnvXdyZsFuthiS3oMDPVG/xH9JXPR+AwLBvOQAkYh1HOmG2RJWnVOFtbjGxdHlRW68iHi4SlYFm2UZcGXxTyM37otXmjuVgPYCVXmtdKeGJPZc+zmMJcafRAl8esbxbiw+7zjpKkxAVTC4vfX/lSjUjdu8CKIju0YsFO9wDIfsx4N9Sj6SRMzNeiZ3JnXO2M4r+mNjdxxGdzcHDbv212IuZYgQZ2S0qC4gAQAAgQERAAAAAAAAMAAAAOcGFqYW1hcy0wMS5zdmcAAAAOcGFqYW1hcy0wMi5zdmcAAAAOcGFqYW1hcy0wMy5zdmf/////AAAAAgAAAGgUAVkYhQAAFFRAEQUQAUFUAQEEQUVRERFVQWAEFUQAUFBBBFBQVRQRlAkRQFUBREARBVUBQUERRFRACUAUAEUUUAUFQBYFURVUAQUYAVFQVFAAQBFUUARUUZBWFBFkFUVRYQBZUVQRAQAAAAA=";

const chunks = {
  "pajamas-01.svg": new URL("./pajamas-01.svg", import.meta.url).href,
  "pajamas-02.svg": new URL("./pajamas-02.svg", import.meta.url).href,
  "pajamas-03.svg": new URL("./pajamas-03.svg", import.meta.url).href
};

register('pajamas', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
