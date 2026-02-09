
import { register } from '../core.js';

const lookup = "AAABFYkYwhgnGqgBseFUVBMjWIhxaDcXVURJQjW1WEOGQgZYKA0KAw2+AjeiBoQBOI4CvgKWAQYFDwyFBQEBDwYCngEZCQMJQTIBCm8CWMLip6waIGkVRiw5mMl/flhkDt1b/b9bXwkVRxxAfHgbWAik7oNjcFW/Oi87DwFbsPlaBb3jbLqjV3LpJVsBWMF1dIK6ejYHvv4dxAcRHXmot8DPq+iGogaiB/5gL4rZP66wCuYcjD2VXPs2K1YZNFZbIdbR0faR4wDzleSgHFL7UuvXh7nbnLwq8yn+w85OvzVg8NafRg+5bQBl8kQUWOoSSqEmG7mrJkTseyVwkOCybow9nItJiY7SuPK9B4nYaHbstUUopAICAAAAAAABAAAAGHNpbXBsZS1saW5lLWljb25zLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "simple-line-icons-01.svg": new URL("./simple-line-icons-01.svg", import.meta.url).href
};

register('simple-line-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
