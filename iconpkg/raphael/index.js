
import { register } from '../core.js';

const lookup = "AAABdokZAQoYNhoZ5UypWBuahFdpcWMTKEVSFlNllWSGYXREVjYhU3cTNZVYNboChg8CBRsamAHkARICSwTRCAE9AQUUBhAvQzOaBg4eAVoEBM4BBAYQCAwHAhk5XgIcAckCAlkBCrBE89Zdqs5dW4dWb+viU+TeDFgT0BK3gRwHRfvlMKdEwxFBZXMHsIetQrR711KmuwuU8yeDqVnnlm++x74HWGamXTIMpDxXy8ZGJvmHKXCiltEsLJ/XqFPOYPGdTKhNQ7v59IxWQqcHMHYATlxAW8ohgLOYc+iJGC1DOa0V2JXuZysKrp4c6n7hocfX13/Fql1DsVtC1xe5Msvw4Zo4xqvfoCmIR2o4+W2/f/pxde4l8oMstLK+tL2eFLOmm/1dHgd08CKmaamAlPm8sxsCh7CoXqpQ2l0t3zwdP7s7G2Ip7xBSQnIObtt+DhsMvUUeeoE0lgXB6wZCgFMKWKQ5SBYHdOP5ypUb+775RwAhJAABDBIAAAAAAgAAAA5yYXBoYWVsLTAxLnN2ZwAAAA5yYXBoYWVsLTAyLnN2Z/////8AAAACAAAAQwEABUBABAFARBBFAAAFFAABQUAAAREFQARAFAQQQQAAEQBAQQAEAAERABAAEEBAQBQQAAQEQEABEABBAEBAAABBQAAAAAAA";

const chunks = {
  "raphael-01.svg": new URL("./raphael-01.svg", import.meta.url).href,
  "raphael-02.svg": new URL("./raphael-02.svg", import.meta.url).href
};

register('raphael', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
