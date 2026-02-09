
import { register } from '../core.js';

const lookup = "AAABB4kYtBgkGgxoPTVSM2LHOHdDNFWlNHVXWBJUGVNjWCoGDQEVsQG8wANF+wGjAgMHAwFCBQrwHwgIAZoBpwE1jwMmCwiBDAQBhAECWLRKrqcYc4Fgl1fhlRi+rAPy5qmZDp82Mp/ZW8Wwvi4dvHOd3KN8e9zF5zDpac8XUM5T/X/Ev4y1HrCsldfvxfjkCrBrlYfQBZgC+VKXkn42FTM8UW0Ulp5gAT8eJKxGdgcJ/rUk09cb+M/zorobXb26aAIi9CUp0tDhFsMsz6lTdf0d9z/te96T1kYX2qa+Fc6MER5W/5Jat2BpyZ0QbCksOzhYn62QrTTOylv3gF+KYuaULfJFgAAAjAEAAAAAAQAAAAltaS0wMS5zdmf/////AAAAAQAAABcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "mi-01.svg": new URL("./mi-01.svg", import.meta.url).href
};

register('mi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
