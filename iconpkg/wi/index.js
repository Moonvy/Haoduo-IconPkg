
import { register } from '../core.js';

const lookup = "AAABRYkY5hguGhgn/tNXQQVyR2dQJ0syaDWENHNjY2aFdHk4VVZYMAEmAfgEKgjiAggUBgGCQQgDtQESEwkEFgISAmwHSRm3AfwJDSH4DpsB/wUDEAgDNQJY5uo4MNj57RuoPY1c/9YCfacHtBU/IMR+9q8xnK8kUNd6KrCK6X45/EHl2O15w1cOsLHKCmi/qZR5gEdnANfWjVvxD1rLTJtBf5iSyH8QH6QoYWUXF9LNfKy6eA6TzY04S1kslhXcoDO6J+UOS75PBmuzAoRqTVa+srf6cu6tj4vCeNEiOd6gBlBIzaoaYWUYFWQfIt9bJbdVEKE44eQHDz1z2bfSVcE6NoN6jkldjYlitSzYPiZzgjisPDwe/C55VD9fRrLdrVyrTNIyXefykKnvtvaaKu6eWbJyeZXuycFjvz8EQp3qRgkEAQMEAAAAAAACAAAACXdpLTAxLnN2ZwAAAAl3aS0wMi5zdmf/////AAAAAgAAADoAQUAABQAQAAAAEAAFAAAAAABAABBAAAQAEQEAEAUEFAAAAAAAAAAAAAAAAAQAAQEAARAABAAAAAEEAAAAAA==";

const chunks = {
  "wi-01.svg": new URL("./wi-01.svg", import.meta.url).href,
  "wi-02.svg": new URL("./wi-02.svg", import.meta.url).href
};

register('wi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
