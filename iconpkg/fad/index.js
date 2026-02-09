
import { register } from '../core.js';

const lookup = "AAAA5IkYmxgfGtwG7NdQhiFHSIRGMyh1YldkRlhCBlgjFUYDoQECsQMBBtMEFAUCAvwCASaRAQUbEhRKPjLaBBUBAx4CWJtWO4JeaWMhaam5FiKxMOJXP7p4rT6W38RMlJQwjHmTNW/W/veD0ObZIjv0mCrxt0XpVDAvHAK9+s/v7hQmRC7l6+1z1Se6qYKNhjtdcjQB2qA75x2nhPnv490+4BZeTPT3Q4BJxPld6xvsGL7ZlEEuuxflrh4bQ4JR/0ktaLEHXIo9LeGGpqNNIzidn5I8zh4paGGGM86SvIjTK0QEAAQAAAAAAAEAAAAKZmFkLTAxLnN2Z/////8AAAABAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "fad-01.svg": new URL("./fad-01.svg", import.meta.url).href
};

register('fad', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
