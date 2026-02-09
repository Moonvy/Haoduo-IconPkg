
import { register } from '../core.js';

const lookup = "AAAA3YkYlxgfGhHuVMJQUyZGNmZSFzmTNkJYVWR1BVggBQSiAaYBDRgjBC2fAdICAQMSPg0E4xMUBhwDGrABSSgCWJfXjpN2s4WoDLHHCUoLoC64m9Wtz3KCd5YCjCSe8r6W56/kHuse3XoKWq0T7H4n4mCthHsGojcJO4ESRI7lLRdTa9RScP1YohslBxsY5oAlMj8clvG98ac/FvIhh/gqICRBzRKVcA8Ey4skp/K+//PaSOwWGeR/aWnF/tBPqdbtgeO65Dxqj0i5y+ywdnTmCNAdKyY5rCfxRIgkIAAAAAAAAQAAABFmYS1yZWd1bGFyLTAxLnN2Z/////8AAAABAAAAEwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "fa-regular-01.svg": new URL("./fa-regular-01.svg", import.meta.url).href
};

register('fa-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
