
import { register } from '../core.js';

const lookup = "{{lookupDataB64}}";

const chunks = {
{{chunksMapCode}}
};

register('{{pkgName}}', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
