
import { register } from '../core.js';

const lookup = "AAABBYkYtBgkGtz1eItStFUihUh2gjN2ZzdURCdWZxQkWCgC4xsJAwQBIQgSB4EBG64HAR+iAvkCKMEDAwIUAx3BAgJOFQwkDwoCAli0isXcz/Mb8rrXfp2VgeFSO/0879ckX12QHqkl5pK+lYDhGMWsvFP3nTZo57WisDN2e4yW+PlzaWKsw1rP3NLWzh3FMq23YPd7/76Vvc8bU3WZEZRgjFEpxKmmvpcerVY/A2s/Kb9G2nPZFn+f8rAJAQc09ErOk9PeJPiHbTBbFeTpBWACW7WfFR5QLi18l9BsNv1GDu2w5iIXFCyspyz+EGmukpjJOM6j0J8dF1gKVwIYnrrKRQCQAAACAAAAAAEAAAAJbWktMDEuc3Zn/////wAAAAEAAAAXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "mi-01.svg": new URL("./mi-01.svg", import.meta.url).href
};

register('mi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
