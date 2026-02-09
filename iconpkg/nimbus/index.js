
import { register } from '../core.js';

const lookup = "AAAAz4kYjBgcGqaVavlONjRBhGQ1dkmjZSd1UlZYHw0CCxoI5gMBFA0GN4sC2hcFAtUCFqgBVC6XAQEEYywCWIwkTO9rebqKyL7Pyh79aGyVHVIe34e3RgqfgcbkukRTNCo7nseA0gfXBzC9v4J+8/51pX1nmQEbQMSHjHE0lBVwjC1xn5/s6PesprMGtdqjr7bmbXPremini10U4kbIOTvYxRZoLOK+ldchrNlEdlDPIMXO0mwxeoGwYOMgHvDTD5UQgQaDbGUH/nPJqUQYACAAAAAAAAEAAAANbmltYnVzLTAxLnN2Z/////8AAAABAAAAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "nimbus-01.svg": new URL("./nimbus-01.svg", import.meta.url).href
};

register('nimbus', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
