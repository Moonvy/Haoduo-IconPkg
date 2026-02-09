
import { register } from '../core.js';

const lookup = "AAACpIkZAesYYxpLKlnYWDJkVGYjgqMjZ3YjQ4hFZRVEhiNEZIOXIzU4ODWERCQjZUU3plVjhUZXWWMyh1Y3K1aDAlhlArwBHDIGAgKJBwbjFQICmgIhDQ0GAeEItAQSAyILIwcB3gMFBRAQBicD+QPHApECCwW6AQOgAwYWAe8BHQECBSYFBSUYsxcQC4UBJPMDQAF4D50BAgcJFBygASgSFA5vDgoC0gUCWQHrWAP1px1Qmmsl0JmX8Y7yf6QJNhIn/jpdnS0rMvI+retlnF3zHRt1cJwOj63wOzgeLWmcOF24shQhfUqHPyywkyD+eFRauiYb960tdkBE1kI03pgj5fLpWn2UiawDp+iMHEGvlLaqU76+VvcNkm/s8gVxHf3aXFJslcXCizqub7A9otryUR4jj3nA9V+vyzIV/dX2UpVspALQmtfLRl2+qebLHpMdyZDW4eS7jCF0VacxgRyClIOjo602LEIKiRLY7AeKFgt9yhanR3Q7pLOPERsgEHM7+mDL3FLwacfjQE6WdVevHfRBJWEc1/i7QMI27dUbuqibRuS4wDsFRgdL/vPCTmcq+epeFBVNWAm1D8qphfG0NayPIgR19g5tMGDq6nZQ74kSMADaIcgtjs1ga6UmYY/h5mFn55az+ua7NA9lomF2yPyZLI1QeAEYrWGdC+ZGkpDP7odaCkinRa2w3elNh16azsXsKdlcXeewBlrkw3jv15mFUB4Z7aCJOvS2mkC5sU7JPoZZ9/C2g2r3zrB7+LOjaUVf/pwwXC1Cn1gL830cVhKMLmCDNAEwDkE9mGBReEldor/hpoCLlsrfezXPRmHGlCdlynGZVn7HZ8yYoeSpINBXXILlm3LB2gsWD11HMqnZl+chXWlNRAAYYAAwICoIARAgBAAAAAADAAAAE2ljb21vb24tZnJlZS0wMS5zdmcAAAATaWNvbW9vbi1mcmVlLTAyLnN2ZwAAABNpY29tb29uLWZyZWUtMDMuc3Zn/////wAAAAIAAAB7BaUSEYAgBWJVIUGCpAVBhWAFAEYlEQUQIABgqmFhQBQGRSgiQUYYgVFlqQhEhFYEAZCmSElpUhEVBRUmFBYkUZiEEUWmVRFUCIRgRFaFVmGEZYKCFBBYEQFUEFVJAhEFCISAglEBlGQEVBlQmUVGSVVQBCVYQQFkWBYAAAAAAA==";

const chunks = {
  "icomoon-free-01.svg": new URL("./icomoon-free-01.svg", import.meta.url).href,
  "icomoon-free-02.svg": new URL("./icomoon-free-02.svg", import.meta.url).href,
  "icomoon-free-03.svg": new URL("./icomoon-free-03.svg", import.meta.url).href
};

register('icomoon-free', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
