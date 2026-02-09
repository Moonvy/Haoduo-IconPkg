
import { register } from '../core.js';

const lookup = "AAAA9IkYpxgiGmY0qZFRaEM0NlV0c4KHZDV0RRA0dpZYJUZRBAUCAQoEIhkOogICvwG+ATcHAzMiAwfGATQDAwEiLIAB3hECWKednTrkhd2B8bxAnxEJdba8qP8gIkhAaS9N8BkIKZp597eBwet7xxx8pkdUKQcss2xGdyWXyoIhJRns+QqrBhHli16qt1PtpZQ+ttb1SVusmUsXwzhz7CEZKKmBtfATHB7/tIshtqpR4p5/d1PNZ0uMUz7MAeQ678eWeJDRPYQkn+MBsTdPChlk/jTY74QFjcCx7xDOBHxEOMg3s7uQ1WSi+wisWs1HgUUAQAAMAAAAAAABAAAACm1hcC0wMS5zdmf/////AAAAAQAAABUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "map-01.svg": new URL("./map-01.svg", import.meta.url).href
};

register('map', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
