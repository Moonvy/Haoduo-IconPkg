
import { register } from '../core.js';

const lookup = "AAAA4YkYmxgfGhsx8SNQRDhTImKDMmVWWTg5iCOGBlggOw0HAgMCAwOSAQWAAwoSIhPuCCYzC8MVCRRCBAiiAQ0CWJvL8reUcaxnYEZcy0iDZbB+NQ7Yt8leKSSyDbLG0DwCKn9jjKF0En2yprUeywWiAMrQg/KIXQ5XlMCnu0H6ds2hyOyySLbTEv1DnfBLgVzYE8a4OvImLK9CMMlRdoLW70dOqQGvp3i9wlK5z5t4ri8Qw7mOX3FRo1zfKhnGPFAqcbSiDFNU3kewYGfmj2k592qOrQ9w9tBCiCFwb0SAMAAIAAAAAAEAAAAKYnhsLTAxLnN2Z/////8AAAABAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "bxl-01.svg": new URL("./bxl-01.svg", import.meta.url).href
};

register('bxl', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
