
import { register } from '../core.js';

const lookup = "AAABZokY/xgzGrA2LqtYGkRYhYVHanw4MkNzQ3U1NmYWRXRVREJkOCEGWDMqBShTCqsFGckIAgXmCwrUcUPiAQEHBIYCAxOXAgEBBgJjWklLFgU0CzABAQIojAEDAUQCWP+Ch7BoreZ25vD05ZN5PwdO3KS+IRzV8kX5/lmY0pyc/m0j2g7axfcuJhSV8qlX5NdtMLwsDYCB+thQtQcb9NJK5meCrbmpUWiqLlF8ie9g4vmj8JyLHphC+u9TPtCVOwrJG4OuMjXfHrqgjlLk6r6H8yljF0RH09G9XxUqGNqLpvKMMidADhvl17aXaawmvnz7L2Aw8SXfaqhvbGUUGPkzPX58ynFz62Yd2hroc84D+eVI+lO/F6ilh9HlOBNmI2J6cCv91wFt25bXALtpDL/ZApMgqJLIg6ztVgp628S/HRE5QTAnMFZhLU4b3Tu+cBb7eSyv5OvjiCRGlQegp2BHAIAGAQIUAQAAAAACAAAACWZlLTAxLnN2ZwAAAAlmZS0wMi5zdmf/////AAAAAgAAAEBAAUERAFAAFBAAQAAAQAABRAAAAAAEABBQEEAAQAERAAABARAAAQQUBEQBQAAQAAQQAQEAUAEAAAEAABFEEUAQAAAAAA==";

const chunks = {
  "fe-01.svg": new URL("./fe-01.svg", import.meta.url).href,
  "fe-02.svg": new URL("./fe-02.svg", import.meta.url).href
};

register('fe', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
