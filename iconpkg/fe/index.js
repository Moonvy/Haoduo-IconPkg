
import { register } from '../core.js';

const lookup = "AAABbYkY/xgzGjgcWS5YGjFkM4F1NFhJQyhENEY0RmSYOBKJh0SDgbcDWDoCKTsBA+AFEzAFBOwEFNAHCQWuAgENDAQHKQEEAbUCCAghDO4IjQLMB+UDE9cEHgcJgAidB5EBuwgMAlj/26555SyCOWYe+mUmYN9OVvlXUwzmuZhQHa1vKfpSfN/Yu6CD1ckKjqcDh0faMnmcqDCv8kr3YH7Z0qwOLm2W/nobYb5j18ggcILTejC6JE7RWRUbFkTSQXHwQtcdaYy/xL9osIFz+RvtUfP0FCXaRYcRnG2lkuOAG84q+cX9AayI3dGYbRhp2l/w5BcsJmDcDRT7GqY90ADvSOUjO/Ko/q0vCi7XbAdzi+X0g6lGIzKjlZxWMItT+6BqDubatsrrveL65D98JxyVF77kBzMw8SHv+ZW+O+jXtTg1pC0efJNA8uupB6rqAok+J9u85pNnYnCovhOXaL/lGIdRdmYrR0EAAQA4QAAAAAAAAgAAAAlmZS0wMS5zdmcAAAAJZmUtMDIuc3Zn/////wAAAAIAAABAFEABBAAAFARAAAAREUAAEABAAQAQBEQBEAQAQBQUQQAABEAQAAAABQEBAAAQAAAAEQBQQRAEAAAFAQBQEAAAFAAAAAA=";

const chunks = {
  "fe-01.svg": new URL("./fe-01.svg", import.meta.url).href,
  "fe-02.svg": new URL("./fe-02.svg", import.meta.url).href
};

register('fe', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
