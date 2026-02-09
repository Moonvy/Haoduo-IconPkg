
import { register } from '../core.js';

const lookup = "AAABzokZAUkYQhro+hp/WCFEdRZWQ4QmdbtSYidDQTckcjJDZVmFQlhjZ0JXO1lWdVRYRhAOEJABCU4DAyQDoANWAQ/TAbUMzTYBAh1jAgIjBUwVAQK3AQgHBVWAAREtuwIVfG8JXSl2AQUJF/lmA88EOBEGVfkBEwUCWQFJ0CoRGjx7gTYSyy+0Q/xufLf3eJ8WS1RTfBWHNr0OU6E+rTKC9VLZjZ7mzxsyjl2tzyMyqfQthFtdvbsKHfMsRsAOTRQpwyGQosUH1vcLFgO+OtWcUBs5VH00PVfeZBfu0A54x2ImNhoFTuObSys3xrLOBzRwLEQ3vXVWqDbIBAcQz4WXrYTt26ydlDvbZ2ilsfOC2rb5ZP6Cvq+GvL4Bs3OlK9r57BwWGO+DMvm7DMy20EPR3u106tJTwu1NlQszTXr6zq5rqdcmbh74bJO1HDAS04Or+mAThqln4tld0vxhCg+v3EcZTmEAEK4jyeP2umu2/Yfy0OnJW/2ysCcc+orF/5SmL4rUCvi8lRT8waR6VDaHmT7sVhh/ksAD3/nx+ckyPP34um1tMHaeUNG/k1RPZOvkhRKtPiTSPbT3nh/tOArb3+2iFppJIAAIJEQQAAAAAAAAAAIAAAAXZmxhdC1jb2xvci1pY29ucy0wMS5zdmcAAAAXZmxhdC1jb2xvci1pY29ucy0wMi5zdmf/////AAAAAgAAAFMEBEUBURFUAUQEABFQAUAEERQQQUQEQERAAAEQERQFQEBRUEUBVRAREQFBVAQEBREBVVAUAEAREEABBEEUQEUAEREAQEBAQQAREAQEABUBBFURAQAAAAA=";

const chunks = {
  "flat-color-icons-01.svg": new URL("./flat-color-icons-01.svg", import.meta.url).href,
  "flat-color-icons-02.svg": new URL("./flat-color-icons-02.svg", import.meta.url).href
};

register('flat-color-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
