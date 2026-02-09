
import { register } from '../core.js';

const lookup = "AAAAnokYaRUaUK9JJ0tkNWeFVCJipVRGBlcBBQsE2AcKfKABEwMBlAEJ5W8QJZUCCgJYaYe916WC5olScIbHLAJ42h8w4Tkprr9tKwAHAL5o/dHrRCxgOptrIJBdzn6mEOVfbSpIhBtsTmdn5N/cxwqDS4HlBzNp+4HVXvbyvJyIRq4L7BU0Wq3XtVDNU5Wg10q+p/4eAjqCE2WaaUMABQgAAAAAAQAAAAtpd3dhLTAxLnN2Z/////8AAAABAAAADgAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "iwwa-01.svg": new URL("./iwwa-01.svg", import.meta.url).href
};

register('iwwa', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
