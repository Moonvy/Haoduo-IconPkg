
import { register } from '../core.js';

const lookup = "AAABaokY/xgzGkV/MRVYGnaHhFo1InUlG3JVFTZlMxRIRoNHZGNGZFILWDdymAHVA/UGC8MDrhEICAEBAiZWXKdUtQFYCiBdAigFCwEEpAEDIgoFyAIDBgI+Ai8uDEEDEdhlAlj/DEL9+9m9GNJALpO5yeWsUt2BJ/rrKoI5AKcWLPkDmKDopb4U68ROE+YU8u2+73OgI6RRFyffMMoBCrxXbFawGjvajIgHLjNQ24dxP+XVvyQwHi/3kotfqPRvh3wOfJXb3HrzzkG/MDWD5dB5HQ3vShGvmBVWKzu+F/5wiWmoqofabWaLfNHwG/kY8gflY9GXqddgbddRAnqtDtNt6iXjSAf62tdz+bvX2jJFnC1po2jkU66cv7qVYOa+fq2mJsVGMjhoHdgmYLVHZj6VjlmTGxuWZyzy+aip4rbxefBlguT0YfseRGrI0nYhgOZTGz0cKSOsYiBw/pxO+uSDCt8wRwCAhoAABAAAAAAAAgAAAAlmZS0wMS5zdmcAAAAJZmUtMDIuc3Zn/////wAAAAIAAABAAAQRQAAAAAEQAAAAQAAAAAEBAAAEAQQAAABAAEUUAAQQEBUAAAABEFFBEABRAFAAUBAEABURUAAAAQAAAEVEBAAAAAA=";

const chunks = {
  "fe-01.svg": new URL("./fe-01.svg", import.meta.url).href,
  "fe-02.svg": new URL("./fe-02.svg", import.meta.url).href
};

register('fe', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
