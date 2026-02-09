
import { register } from '../core.js';

const lookup = "AAABpIkZASwYPBqru8DrWB5jYlQiJkFFk0g3NWaDcnY2qWRYRyE4RzhGNHa1QpJYPQFJAgIlBAEnAQsjAslBaQEgBXMDD9cBrAUBiQJq4gEzA64EvApHICceCR8BFwPmBgPiAQUEExa5nQEKwB4CWQEsMFMwE89ISa479LeH4aueLsBc+W9zs6oMofhXPLBoc8dYC5GS22B15l/g9qCqBNJMcj92zZpB4Ye0uoUiHpyToEiIm4Q7aMQv4HHInD8CgB4403gUyQyu6WelVJVeT/3Ri7SczObaBhCRrIFc+Wv0myoFyPaRkWMdZzBSerW0+J4rH1/RGk/ur1Z5p6dX2qcSUsFqkX6bBgbeqAoDoOPnDF4YM0ljj8FUxj9PgajvQgBHC78OUKOlXg0NOBxP2/6TSgnxdmRCc8a4Y9qII7zebbN8RknvFmjusGus+PBpBD9HToa93wRVSXBzcSkoT9i8RjF5kdLAKIrC3+OT87YkDQYV33lEPZy9hMC/mLqbW3TQI7G/Qy4VE3NLFPyKkxWlTZtyhPhy4150PMgWSAQkAAEEAwYFAAAAAAIAAAAXc3RyZWFtbGluZS1ibG9jay0wMS5zdmcAAAAXc3RyZWFtbGluZS1ibG9jay0wMi5zdmf/////AAAAAgAAAEsQQBUFEAAAUBQEAQEBEFAFUAEQUQRAAABUAQBEAQQRAAABBVRVBQQQAAAEEBBVQERBEBAEQQEAQBAUBUQEARBBAEAAQFAEAUVQFEQAAAAA";

const chunks = {
  "streamline-block-01.svg": new URL("./streamline-block-01.svg", import.meta.url).href,
  "streamline-block-02.svg": new URL("./streamline-block-02.svg", import.meta.url).href
};

register('streamline-block', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
