
import { register } from '../core.js';

const lookup = "AAAAlIkYZBQad3tmaEqlMTVVWDVxJYN5UxuTAwMCUAOpCRM6BIwCAhSkCwUCWGTymIJOhAZrOx4V0ownLwJHcwem5TuVVC2WW1C3GZhses5rlHWsW856F8e4utGbHsMHJiyfGQR/HZ8p5hEo7TPpp35V4iLIyD73862eZ6surf8drdjX1xvUYPAhD3BBon5+v86hQwzQAAAAAAABAAAACWV0LTAxLnN2Z/////8AAAABAAAADQAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "et-01.svg": new URL("./et-01.svg", import.meta.url).href
};

register('et', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
