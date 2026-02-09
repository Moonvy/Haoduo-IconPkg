
import { register } from '../core.js';

const lookup = "AAABM4kY2BgsGsmT8QFWEzY1RzE1ZkYVUklMRzdzhIc2ZZVWMlgtDRMDHg0HCwJEGXAQAwPeAgi0sAEFIgFlBwN5DJgBlwSXBFoEGdcBD5MGmgMJAljYzPF5kfLXBIS2gBFrVo+V8zxUXFX3jVh4rB4v8jMVJbiRCR2d9gobh1Mcmb44yBERBTrX3POiTUqjc4tY5MBjC4P3WgNbQZ95RBZIf81s13G58IEq8/8HbKFPYecR02AV9stZxenoxragX3LNQiZUPsYD6SB7i+omfrtxEDynqGSdcdzue9dwL21QgWAkEbl9zu+HLtKOB7LHvYMgI4aYy6+2DX9VMazue+9jNXCp1UAelyoc49cjrI7v5rkrgL86hlC4PzjCQTua/GB0Dn6VfbqRLZkFm4uVRioBBgAADAAAAAACAAAACnVpdC0wMS5zdmcAAAAKdWl0LTAyLnN2Z/////8AAAACAAAANgAFAAAABAEAAAAAAAAABAQAAAAAAAAAEEAAAEAAAQAAABAEAAAEAAAAAAAAAAAAQAAAAEQAAAAAAAA=";

const chunks = {
  "uit-01.svg": new URL("./uit-01.svg", import.meta.url).href,
  "uit-02.svg": new URL("./uit-02.svg", import.meta.url).href
};

register('uit', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
