
import { register } from '../core.js';

const lookup = "AAAA/4kYtBgkGi5pivBSVRRjOVU3ZmVlaWczREVTE5V2WCISBxEGIG4JIkIzBlcEFvcBzglJUgEECgIQBRMCQYcKGasBAli0lvOmBf7cmQL3OJBi0+kCVpM0ab7vNvIbUIfPtbDPF8UYupWKXVKfaPfnCdKXFf98qZgs8na+Axs7f8WUYOHF3NA8e+bWLi2MkkossEa+2mCjMx5rjM6e9Je6qfjEzikyradsRnuVrBGwJB7XARat0CSuEG2AWwq1FFcVaeFRB9nmvWDk/Snefs+fWrcY7ZWdX/i/Wxd1nZJzylg2Hs6i+R0/Dj8wJayBc8P911OfySJTvB2sRQjACIIAAAAAAAEAAAARbW9uby1pY29ucy0wMS5zdmf/////AAAAAQAAABcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "mono-icons-01.svg": new URL("./mono-icons-01.svg", import.meta.url).href
};

register('mono-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
