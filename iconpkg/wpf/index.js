
import { register } from '../core.js';

const lookup = "AAABHYkYyBgoGgwg6xpUFSa1NSFFdTZEJFVlUlVHt3V2dEhYKgELARaTQwYHHQkPlgIGARACAg8FCDsBDQIF0gQO/gSKAg2fAgR2BcoJGwJYyEva+eM0yTrkMhKeYxDVkLIcjqnOzhvOMbmd/6I1D34hqzxbC+qm0A68W9oHNA3uMAQw7a3jKida8O+yXW7mIuneHvQccVDjnkaQJsrQuxkPzwgAj9UabuXeNUO/On7cIf/EqT+zRfu302KHpesT4MTEA3wYT1QgS8s717uNy9xHXZX5yYsdgEOkyPRL3s/T/OYLztRcripOHc6RmauVyVSHCxKSU1PLY4fOaWidFkO9swhM5BYnh61NFJmVPB375p1drJiSnPcwRQIDAQAQAAAAAAEAAAAKd3BmLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "wpf-01.svg": new URL("./wpf-01.svg", import.meta.url).href
};

register('wpf', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
