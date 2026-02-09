
import { register } from '../core.js';

const lookup = "AAAA0IkYjRgdGkriVFhPWHhUN0NFUmRQdTY0ZlQHWB68AwEjfRNIgQIBCQ0GAgQBBhgKoQIiBgJuzQEECGgCWI2s8y4+s1nTBRKHNB5bCa4hHYLUqY2/N3zP9sRt9zZQNLAmSpv4XUP+qqx1WIIqhxFt5lyuB66ZYLVzxN1ZNrBslfIU9My+5pfPYb5Gch8cbOlW0ie6HxLI1k6yD+oBJzldjLAvG1908cWmoc8mm84SnNfFTh0+q4SgdCeeTPjagzCMq9fE/XV7fr7kaWpEgAAhAAAAAAABAAAADHF1aWxsLTAxLnN2Z/////8AAAABAAAAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "quill-01.svg": new URL("./quill-01.svg", import.meta.url).href
};

register('quill', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
