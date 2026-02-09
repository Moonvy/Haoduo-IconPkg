
import { register } from '../core.js';

const lookup = "AAACGokZAYMYThorCKU/WCeENJd1g0SRQaRIuWNlUnUlUERVUoZWVlOUgrNSQEgkNYZlEGVGUIZYUQmQCAUBjQHWBgjGA7sKAQeIAQoI+RnuAgWKHNUeAbsBFhMPEBcNARkHAgkZKZkDNAwcAQIO3hUBugIKNwEBAmoFEgIeAnqAAwwBBkUdIw6SDQJZAYPyaUGO83QtB+YNxaCVrzseAqGPrVUhilEvbGZSA5KV0TYzzOa2bYKjl3rmvqnyMY4ZsLQsuVHo7Z/TfXMZXFVsGJfLdf37FpRjZzsbHId1mMgiclacdh+xDTIQRU6bBWC9/mLB8j7kjpLWrGwU21GCfPmVzx+wCkK1OZ+v4xay9+VlrI9yWPLFv8kMCcqj0JCi6kl3D4PkaX+BAQQFCQft9msQJvLrWyqCzlm+ajP9YE/lrF4Opy/+v1FpqyX9lay/uq1ci+9sbIb7IRe/gR46lcGljNYcOCBo4rY9ZczPqWgZt3uFj51LxS4sPxIWuhZIwa9dqSJEUnOMO5VfhZleMNtkjxUvmGCLSe7ZsZ2BXmvsFZAX1hx/wwfVvbvqD1XSEbMFMAWF4uupkHLwHlT0w35Qtj+567pJrBfC02Eq5DmPDrNQ/Uqp25bJ/lXMD8ScjewDluGgEJMwer5AAs891xymPkJkWOaeRm0XSkAJckGIqDKniL7GX5JCu9HEeo5HpJtKAFEABElAAAEwBgAAAAACAAAAFmhlcm9pY29ucy1zb2xpZC0wMS5zdmcAAAAWaGVyb2ljb25zLXNvbGlkLTAyLnN2Z/////8AAAACAAAAYRRQERVFBQAUREUQBRRARQRFRFQVAAEFQQBUURUQRBUREQRBAEBVAAUUEUAEABUBAQURQEEUFUBBEVUQABBRAAQVEFBAFVRUAFFRQVUEBAQQRVRBUBUUVUVRVQFUBBVAQQEAAAAA";

const chunks = {
  "heroicons-solid-01.svg": new URL("./heroicons-solid-01.svg", import.meta.url).href,
  "heroicons-solid-02.svg": new URL("./heroicons-solid-02.svg", import.meta.url).href
};

register('heroicons-solid', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
