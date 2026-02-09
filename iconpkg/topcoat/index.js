
import { register } from '../core.js';

const lookup = "AAAAiIkYWRIaD3N3nkk1c2FkSEdXtQNTAxQiqQEU8QMDnwEL4QETENgBAQJYWdfRQkZRnYNtX/i9G3qhHvAD/xM/fGzOtZjeQjBr+ZXozbBtUCxHvq1gYEHyOoKsNVIChoe+XZgLAJh+UYVarxv4FRjaySPvIaFOM+4kKb8WpmwhaavP7kGQQ1IAAgAAAAABAAAADnRvcGNvYXQtMDEuc3Zn/////wAAAAEAAAAMAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "topcoat-01.svg": new URL("./topcoat-01.svg", import.meta.url).href
};

register('topcoat', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
