
import { register } from '../core.js';

const lookup = "AAAAlIkYZBQa3pcT20o3ZHdlQXJyZUSFUx8FDUh6SxIhBgEELwNEBQJGjgQCWGS4VSxHVK0mO+Z+eqet6SIE8h6iPuLIfi2VGbpwHS9gvxsGnwKYx5ueF6ufGXrzLjMH2BE7Qc7X7dd+zn/U94RQzg8p5RWt0nWWZ6Edc8iU8LcoayeMppisbCEH/9EeW8NOgmtbQwARAAAAAAABAAAACWV0LTAxLnN2Z/////8AAAABAAAADQAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "et-01.svg": new URL("./et-01.svg", import.meta.url).href
};

register('et', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
