
import { register } from '../core.js';

const lookup = "AAAAl4kYZBQaQTWPUEpVeFZEVHY0U4FVViwO+APiAYwBGgwJBxkfHxMGA70BMQQCWGQzrcifISybw2ctPubifgJ1zi7YetJU/9EZ7eVQrMe4Ka0dB7ce6UEon5iMupg78mD3Gb8epmt/nlvw1Nc7ax0Gzg+hW2wbF4LIVZZ61xGnlQQmoqsnfoSUB63zFS9Hfk5zIs5wQwCAAQAAAAABAAAACWV0LTAxLnN2Z/////8AAAABAAAADQAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "et-01.svg": new URL("./et-01.svg", import.meta.url).href
};

register('et', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
