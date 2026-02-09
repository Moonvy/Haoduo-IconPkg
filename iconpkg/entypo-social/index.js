
import { register } from '../core.js';

const lookup = "AAAAdokYTBAa8XfIy0hGVlNHR0VVM1B+B9IBDgSAAQUyAhACBSACAlhMQomYtGXwTkHGjy5ZshD1UblCb6Si4YPvUyH8zQy31atab304E8MlrwvRtgOFXGqhRzq2i3aZQAUw7PcSuvPyKuibHYgewmGVgMyYokIggAAAAAABAAAAFGVudHlwby1zb2NpYWwtMDEuc3Zn/////wAAAAEAAAAKAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "entypo-social-01.svg": new URL("./entypo-social-01.svg", import.meta.url).href
};

register('entypo-social', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
