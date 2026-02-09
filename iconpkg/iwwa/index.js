
import { register } from '../core.js';

const lookup = "AAAAmYkYaRUaLpCRnUs1WTdic2JVIleJBFJQ9AsBfyYIOSkBKxgI2gaFAgECWGl+cKc6KjpSHtEK/s7aX9cpLEtsWoKllQL2vohtADNooEibg/1QxzSGAGecC+XsSmkg14S9teVOruHmYB+m3+Qsgq14AhvrEPtTgb4TbWsVOTBeZWe/B4GHRtXH3ESuzdcHiZryvGkrXZBDYsQAAAAAAAEAAAALaXd3YS0wMS5zdmf/////AAAAAQAAAA4AAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "iwwa-01.svg": new URL("./iwwa-01.svg", import.meta.url).href
};

register('iwwa', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
