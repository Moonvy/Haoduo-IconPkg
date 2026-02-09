
import { register } from '../core.js';

const lookup = "AAACV4kZAa4YVho/AOGrWCt1JlNqSJKVMkNWpnNTNHNDGGuFNWQiNYh8JUU1FVVSI4ZjUzRzZYWTUUOlWF4CVs4BAQkJjAlLVwIChAoZkAQCARIGgwGgRQFSAyEFCxpQDPsDyDUyHdQFAwUQogEBQAdv8gOjEBcWBAgJGwRUGgsBDX65BAMLBg8HAQiwAgxBB7ADAfAPCAwGAqU5AlkBrrLo1gvXf+IOfvOVS0SirJzERIGwpuUxbU2Hp2cdYolm3SgGHcL2toOUz+Z6KOpjYeIkX4Jq2Ky5sCzRqwUl2ewY7WjfrzZ82QlA9esduHU+TLzyZd1tqaC+mEOK3bLkclJzRb+sVtmhb7DZRLHzqhTCoJIAPNAeFI3OlKH8RLA0ZHifkWeDEhXgXIZdTGgccYeMILmL4KATdWHJ6DAVB1SNI0gdq8WVDXt1FBuvgLi/g0CilepDbaSg2eb9Bc9iML6TGEWg97RyNiDAmpRZ7FutH19/U2mdcRP+3aqp6Im1vQJseL8XDGBzFJCXKq+1lpxtB7SQvgfkA8Q3RQwNcBbRKbuFqp0tnNhca87+0PlGZD6C5l/yNaPZrYaU0Kwjn/jyMIu0uXMrgqaBhB6J/ha6KI9Dn/sDHAceCTkXY3puf2vVML5K6Dl0JabQ7AaRzpYdBMd2OFuf7IdXX8SpXPvKif3ShKt8yPSHWmCGPxsKvuQflb+XugdEpw8zpdy/OOUale88jhutLDwcVjF22oE0IZ/HEY2soNDj5xIH11Cm/Z52p7m1FG2SKuCLOzRLAIACQAIIAMIAAAEAAAAAAwAAABRzeXN0ZW0tdWljb25zLTAxLnN2ZwAAABRzeXN0ZW0tdWljb25zLTAyLnN2ZwAAABRzeXN0ZW0tdWljb25zLTAzLnN2Z/////8AAAACAAAAbJBFEVEBpARBUlAQFQFFEVABRRQVGFAAZRGQQRWiUFCCEUEUEBEBAhRVUEUQBUQQQRRQlEARIAFCSBFFlQBRBWGQUBUEQFARUhJVRBBBARAAQRJUQVBFQAVIZVYFGVAFkEURRVWFRFAGRVVEAQAAAAA=";

const chunks = {
  "system-uicons-01.svg": new URL("./system-uicons-01.svg", import.meta.url).href,
  "system-uicons-02.svg": new URL("./system-uicons-02.svg", import.meta.url).href,
  "system-uicons-03.svg": new URL("./system-uicons-03.svg", import.meta.url).href
};

register('system-uicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
