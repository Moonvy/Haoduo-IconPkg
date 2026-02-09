
import { register } from '../core.js';

const lookup = "AAAAl4kYZBQaBh/EhkqGNaRVZXczJTM3VkS3AQIItgofCAkDuwEdAgkEBg2XAQECWGREuq0NZzkbB9GD6zbbq0oOxfQG9OVvLaxUObJ1JSAyqIxpqDSQZuqSc/9r18Ru88/y/1CjlpO2opKV+cj95LcCjOzmHg/5TjT+JfRH1Gxdl+Ztpiok+a+Q10jiyzVHJk6nvL+8QwhAAAAAAAABAAAADmZsYXQtdWktMDEuc3Zn/////wAAAAEAAAANAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "flat-ui-01.svg": new URL("./flat-ui-01.svg", import.meta.url).href
};

register('flat-ui', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
