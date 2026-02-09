
import { register } from '../core.js';

const lookup = "AAABG4kYxxgoGqdGiB9UR1VEIhhyoydjM2UkVGeGVChJNqdYKRwcDQIBAvMCoAICwRmaAwIMBQkaDgETb4wCHtAHBhTzB/YBAkz/A9gGAljHcUKD3OHhzZAumUxuMO9UO4rCZTzCnP4rR6IWMAZ7U80+74xx6NAn6WHyF7rBehtc23s8yHuPeOgfbk0BUs3tNTwqNn60vwcQ+Lo0POdfyQFyPq3FV+rfVKvMX5MhovF4ypFdshL3KjWTkNkP+yRUt7cL2+OOiUsGE6qL64LaUDtguasiuOF4saaVLnI0xUgxjHqPOcp616Kd+CK/YjN8tu6MzO1UVJ89qPxU7fdoopqhgGsY/e8v+h73tpmvN2Dzcl71cyGp6kUDhsAAIgAAAAABAAAACmNpZi0wMS5zdmf/////AAAAAQAAABkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "cif-01.svg": new URL("./cif-01.svg", import.meta.url).href
};

register('cif', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
