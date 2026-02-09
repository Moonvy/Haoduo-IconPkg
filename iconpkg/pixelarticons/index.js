
import { register } from '../core.js';

const lookup = "AAACn4kZAeYYYhpzw/3lWDEyclRUV4RXFGFzVFVDNzJ0NVZTWnOFRIRkdUJAeWZkpkFhRTKJV1VWh1RTRWU4N5OEWGYJAbMBCA0LDYIBDNkBhAEBEzgBRQgLIyIIEusBAgYGCVEIFhMsDwbgDAoCOwpcGQkFgQMQPwjhAQE1kha1AgUCFSaJDwIFBAcCAY8D4QGwBAERFtsBJiRHCA4PBBICH6YCWbsFCgcCWQHmJ6g7ZHtVieYBi/eocyo3NLG1n5POPJAAVzPwlLHP3R1oMrkbEeoXUq3+ZM3/8mzFYMZaIKM2kILcN63zTCz0YGn5VAm3CO6hv+njIKHa5d6CDDfU7vnTvhbRjB/IdD5jToeCSk2HGOqUqYylrHEMisV6/loFC4ekkfnmWcoXHXMgSyzXwkw+0JWSfs2QMVJtNujBtUDkJx0wCZcfzbDf3cp7wxy3q23n9qiVz/yWwTSemIyKyAanG6HzePPJLswwncFzg18ew1ENgr8wS0Td+TDAywCdH5z3cbB7IOGmaYM+JRH85qlHFHbOP9n4utWyOnm/1pMOYXIXG4iYHXz3plXKZx7mhqkx+k7KJQcBdcuqS5yTSZxvMCT8U3sm2WNwC9NK4AIS/9k8gQzxpwbY697ofjn7ImqVbM09Cj/FaPJpWnL9NfVc/ac9rF9d8i2UsG5EkSTQs/1wyMe+u+QzcBefINiG9iZjZ4yObEHmRmvzaqXv9nV3YAplimYsdkYWBQ8DHuIMvhX7btLCMU/nkPgEUFWIQJBYrgLHjOzn2woMyK8Yx5VPu5VLa7NwsIETzhw5MpxkSsML7ClpU91QRMi3mzNURN6FJ3WVlINBkMdvQakWpnM1+Wj2oh4xR3+vsWC+OyWATQGEAQAAAMAEBQAAagAAAAAAAwAAABRwaXhlbGFydGljb25zLTAxLnN2ZwAAABRwaXhlbGFydGljb25zLTAyLnN2ZwAAABRwaXhlbGFydGljb25zLTAzLnN2Z/////8AAAACAAAAemBQkgpBolCmRKRCCCZUQRREUFkUGIVUVVFhWQBWQWokWVZUAFQVBSQVgQlKUmERFIJoUgFBJJUQBFoUFIhJJIFgqEREZBAIRkCVUUVEAgAFVFgJASQBAYVKWVSFSWRIQVAFKEEEBBYBIRVUAIUIBBiBWViUIWgoVFQBAAAAAA==";

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
