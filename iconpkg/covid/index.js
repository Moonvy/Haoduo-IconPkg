
import { register } from '../core.js';

const lookup = "AAAA0IkYjhgdGgo3n3xPNlZ1JiNFdTYbRyVklUQFWB2xAQNWBg4fOQERECMxHQKIBBMGAgMaFg/KBQMPAwJYjqjhmqjtX9T3AAnmFsFEuJrAiVdlmRNyVi+XalR5X2HF2MuVM8MhKwfqix0nk1zbgm1VudMJmkNOPkqJi6c/3umiStkxP37yXCk4o7boLp6J2/4mKF7BP6qwHtTqBwd4jq5JajA5BuwxNWNX7Z0zsYuejwcmkTCRAbLz6laZOTJ4eboxBfsPCvLrjlq8fvxEgAECAAAAAAABAAAADGNvdmlkLTAxLnN2Z/////8AAAABAAAAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "covid-01.svg": new URL("./covid-01.svg", import.meta.url).href
};

register('covid', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
