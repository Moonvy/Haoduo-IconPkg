
import { register } from '../core.js';

const lookup = "AAABA4kYtBgkGgQ911dShVZ1ZXdDRokkQ1Q1FVU0ljdDWCYNbRAqFfsCKJABckwLAQEqGMEBGQYIKRlPBQkTXxIElwEVkgMVDgJYtCW9nkZpU9yQ1/jDP3u1HgU2Hum6rgLPPMXOgP6pzjS+7RiXe3aSn7DPsFqVU8VtOwlbF/dgFNnho+ER57qVkmB/a51+AR2T7yR8LFDSNoxdzpcbnzLeomy+OIHyRsQW18WpLpTQF9qw5sqsWNZfFWm3W2iYv3MkGJYCvs+M5hsep3NXLYeZP/gsAxD9dayt9FYOYFGKYtDTnf8pB7zyph3c8wr35CJSM639rPmfSrUwKckVlUUAAAICAgAAAAABAAAACW1pLTAxLnN2Z/////8AAAABAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "mi-01.svg": new URL("./mi-01.svg", import.meta.url).href
};

register('mi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
