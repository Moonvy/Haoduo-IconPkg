
import { register } from '../core.js';

const lookup = "AAAA0okYkBgdGg4XaChPNGRUZ2RVJhoXSEZWZicEWB0IAQg9CBZvCwIDHzQUAp4DqAFRCggBqAFjdEUZEwJYkGcpsUaV+FEgDLxot8EHIV/LoCRH2owxz0aM4oMVo0SmvnEe/CkOs+EwuUuybn3yuvlRKvRQsApH3TLyq7fuswz8plN8RYymMa6ttv6ndZ6TeKkvFLRjTkQEQQQ58NipO9eHlOckXRK6r960oyc0rFvXvm9xg04yCya1ojiBgs4AqJgUQsP8AgpTSNchaWh+G0QAgAIIAAAAAAEAAAAOZm9ybWtpdC0wMS5zdmf/////AAAAAQAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "formkit-01.svg": new URL("./formkit-01.svg", import.meta.url).href
};

register('formkit', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
