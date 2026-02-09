
import { register } from '../core.js';

const lookup = "AAABSIkY6BgvGhJB5kNYGGJEWEEzVjRUZGWFVnNTNmdIVzVUR7JFBlgvKwYC0gJbAgMrEQ0DCTEHCxwkEG8FFwISAiEJEjUh7gsDCg8yBQEDrgEBAgEMAQQCWOjXu2ncvlcSJEjWROEqJJYmAxUnsyftdyK6HZIuUWNS8UzMN/wDr1w8H3PRqoeiMTCiuefd5cCVDsAbg1nCxUWJSin5ODlDUcj+n7vE4d0X1tE2ZRdtY/EJQBUpj/R7phoi22aemsM6y0AzMRcHdBdK2qCSFaXuUHHtYGMOYKOk5uBui5+0UDPHN0SXcOTvLzIVnhvne+SuYSFRz8vzS8XAMCy4p+ISshtb/3UDalN6pM5CUTqVZODBJ0W5q9Qy406DP7lArJV/pFPtuHjGHVLvJfg/ZLU2KxwWW0uYl/ikxPMTWNpsVgxbRkECAAAAAAAAAAACAAAAFHNpZGVraWNraWNvbnMtMDEuc3ZnAAAAFHNpZGVraWNraWNvbnMtMDIuc3Zn/////wAAAAIAAAA6UBABUAABEAAAUBAAAEAAABABAAAEAQAAABAAEUBAAQAABQABAAAAAAAQAAAABAAAAAQAABQQAABAAAAAAAA=";

const chunks = {
  "sidekickicons-01.svg": new URL("./sidekickicons-01.svg", import.meta.url).href,
  "sidekickicons-02.svg": new URL("./sidekickicons-02.svg", import.meta.url).href
};

register('sidekickicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
