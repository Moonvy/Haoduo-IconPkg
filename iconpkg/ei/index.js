
import { register } from '../core.js';

const lookup = "AAAAbokYRg4aADLNhUdzVlZCM4UcTwE1ShKgARICAgEn/A2qRQJYRkR+B+k383wYoAdtFWhZHSI1h79AqKmMc5J2X0VsG/RIHhT1HhlgvbmfbKpSP3Q6lffjgrPyzyysxzC66Oq48oxfppW3xRtCQCAAAAAAAQAAAAllaS0wMS5zdmf/////AAAAAQAAAAkAAAAAAAAAAAAAAAAA";

const chunks = {
  "ei-01.svg": new URL("./ei-01.svg", import.meta.url).href
};

register('ei', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
