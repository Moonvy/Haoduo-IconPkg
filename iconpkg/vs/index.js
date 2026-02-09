
import { register } from '../core.js';

const lookup = "AAAA5IkYnxggGhpM97BQxhRGaCVlJXQ3ZFFGVTFYhVgfvwG1DQMjDUlkDCgQBbICngIDBLEBAVYUKARECxWPBQJYn6nnQXR09t8BkCiclDIXdI1CQsb4vAg3oJ6CPJIy8trIon+pHaZHmjL8N2No7eKk/hC0MSWCpo9Waa38tLzmF19QCNnj59ZjCs+Ur0GS/OT9wx/z9XwttmYV8jQ4wuRqvCknKVM7EVTbRJL3bfH0k9A/tNnRf1H+LY0BfCwB+B0V/2gnGE56BVtqfhxBvZVj2Heh79LA4BVqKFwaGKZSTUQIYhAGAAAAAAEAAAAJdnMtMDEuc3Zn/////wAAAAEAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "vs-01.svg": new URL("./vs-01.svg", import.meta.url).href
};

register('vs', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
