
import { register } from '../core.js';

const lookup = "AAABH4kYyBgoGl9tmmVUdXYyYnYWM1dTdmZCdrRUVWUoJWRYLAi2AQZ9AQIzRMwCAwQR3AEGCxNvmAQB9gEYO0UajgseNQUQJLEBrAIBSyc4AljITsp56+GUtgJ7BJSeEApo8A1+r7DiKmVuwHh5JeWM8r5kc0srET7gg6nH7LdTmUCP7zJfzC3PgKbmK4cwJXkc8PUYttORPgkB3jSzGsczsTK4lgbsHc9vAOcazCKyFL7k6l9AcuxNAJ5DSr447cw9UR1obaKQAxK1lVD+ila6+gz/qNN9QFvX3n8VzYXoU65F7DKW31S1pOAX48K89/Jsv1jtRQeUkp0HkRozKGrW8XtxR+9IO6HbqdmlUFII28Rh3+iFxIZW/qhFIAhAACAAAAAAAQAAACBzdHJlYW1saW5lLXN0aWNraWVzLWNvbG9yLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "streamline-stickies-color-01.svg": new URL("./streamline-stickies-color-01.svg", import.meta.url).href
};

register('streamline-stickies-color', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
