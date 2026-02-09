
import { register } from '../core.js';

const lookup = "AAAA0IkYjRgdGoB9UFxPNmVSFzR1RVWyGEZjlUQFWB4nAx5qAR4xAwcLKBcBGpgBAqktdw0BBAcj/QwPBDQCWI26D4JyNNNKjVttH9d8EWx1WV1Qs+aENtTMKmm+N7+Cz/bkOaquMB2uCfj9YcTWvs6H85fFXebPVvK1bCYndSYd+D6wsBLFFNc0m76DPqHpLkOcaicnlV+s/qZOe9IeWFxOqQWsYDYfB8TIG1mML6DEsM/0AdoSrhKbc0Yhq/F0jEzqHPersn7dmYd0bZ5EgAAIAAAAAAABAAAADHF1aWxsLTAxLnN2Z/////8AAAABAAAAEgAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "quill-01.svg": new URL("./quill-01.svg", import.meta.url).href
};

register('quill', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
