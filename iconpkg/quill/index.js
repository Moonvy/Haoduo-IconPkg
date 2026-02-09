
import { register } from '../core.js';

const lookup = "AAAAzokYjRgdGkcQTUZPRoJDNHYSRFh7RGhaUTMDWBxBAdwCAwQCFi8BEQHFAg60FgIFBFxG9AwCBQgBAliNhJXP5M/mGwXpXxEndats2hJyN2BYg6zWqteuczT9zoe6sPbq90oqPr74HcXIlx2zv/QS07BQ1KDdfCcmLyGhCfEwmdeNh36pamxOVkzF/h7mJqsHbQ9OsGGmvjS1+BK+gidGxG3MXT6MXBQ2XVnEewE2dRyuH2lb8p7PgowfdFl0svOum5su0jmsQ5zERCQIABEAAAAAAQAAAAxxdWlsbC0wMS5zdmf/////AAAAAQAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "quill-01.svg": new URL("./quill-01.svg", import.meta.url).href
};

register('quill', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
