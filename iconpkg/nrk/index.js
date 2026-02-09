
import { register } from '../core.js';

const lookup = "AAABVokY8RgxGoCYBmVYGWcGRVNiUIRjhjhJZFQ1NCKXp2U4MkaURQNYMrYBOy4OCgQ0YC0P0QEJSSRbBhkDD1UUGwYMBwTeAY0FFeI+bMkB0A4BAQxqDxSUBA8BAljxKr9YqbRYuKkUkVCFJbkjXb2gaobWvgdopYdI+XpK4R5hxiVy0VR2GDYhIOiCD4JGVOgi1+WpbDBGlJUy6EDqlNnQtopgy/xG948CpblfX3XWeCtEz/mYLNHV8hW9n5Plx1+qnoSobpRRMK4kKXDz+6wTfVuVpg4nClA7B3CteUD6sgcsoNPrLu+P3B+ywNdnl37ZHjEmZ3rq/mfqGyHD0Nf+OH1sb6Gg63PFrhsalNmTFZx8hfFovRmCl/abIXXXvtpi8o+SLxJNBPMAsdaLx6nS0uZ1NFLBujO7aEIkAwNJs21zdDED5XUxmznaT1RWqEcIRQCBAEAAAAAAAAIAAAAKbnJrLTAxLnN2ZwAAAApucmstMDIuc3Zn/////wAAAAIAAAA9AQEAAAUAAABAEEAABABAEAAABUBBEEBBEEQAAAAQAAAQAEAQEAAQAAEAAAAAAARAAEFEBAEQEAEAQAAAAAAAAAA=";

const chunks = {
  "nrk-01.svg": new URL("./nrk-01.svg", import.meta.url).href,
  "nrk-02.svg": new URL("./nrk-02.svg", import.meta.url).href
};

register('nrk', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
