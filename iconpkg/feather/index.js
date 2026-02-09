
import { register } from '../core.js';

const lookup = "AAABk4kZAR4YOhoLqbcOWB2TllN0aEY4ITQjZSIHI6e1ZYN1ZTZ6Y2RChTOCMlg7B5cHJy8FCVOUBWE5BdYDBgEEAgEgDAUCEKcBdSnnLxQYBcUHCn0BREsBtA1LAr8BDz8ERloBBATpBAMCWQEeLZTuaRjeUQ++Jd2HvawRPiqMg3LO88/yjZWMIw8Cetkec3sVvb/tbRTmOe9Ot6xtQTbKr/2+hHXTxV00dx2wm89sFVseg3WSto60JJVvb3bRjoFHtcf6fympGPcwX5jDzSLTRYWtCNoGUEioAdcwp9izg72gYfgg17MkF1W18CFjLJXpr9F49LAuMq27Qge9QH52P3Ocvvu/1RtrYJJQi/zuljIkkNIgBrjIRLzF+YimYU5xlC6bRxbWV+QQk3pG/Rwmybbb7f+okvse42OiuihSbactiRMBA4cMVSaEtiwn940NcR7/AZBR0mB6nNU5ub4gVnP+qfZnl4BaNzzhYd+JKhukIR5/Kpyjlzmb8p3jmayfxfBRyTJRSGkFTkgQQIgKAAABAQAAAAACAAAADmZlYXRoZXItMDEuc3ZnAAAADmZlYXRoZXItMDIuc3Zn/////wAAAAIAAABIAAFAAAFBQERAAAAURFQFAAABAQQAEURAAAFQQVQAQURAAEERFUFAAFABUEABFEUEAARFAAQAAEFQQFAAAREFFAEABEAAEBAAAAAAAA==";

const chunks = {
  "feather-01.svg": new URL("./feather-01.svg", import.meta.url).href,
  "feather-02.svg": new URL("./feather-02.svg", import.meta.url).href
};

register('feather', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
