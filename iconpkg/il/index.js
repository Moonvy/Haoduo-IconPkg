
import { register } from '../core.js';

const lookup = "AAAAf4kYVBEa0BXdTklWSHFXZ3ZWAgJPHC+EAgIwNzsvBRcpEQkBAlhUG2kwNvAzYPgePxUpbIxOGBiVK72KbX7fHRk6W2D4jLosNP4OX7mim0HxQn6sLfJzyP09+L7zdf7/JHnTf7QBhzD+DaCmovIx2b3psbUyUvM5mKetQxCAAQAAAAABAAAACWlsLTAxLnN2Z/////8AAAABAAAACwAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "il-01.svg": new URL("./il-01.svg", import.meta.url).href
};

register('il', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
