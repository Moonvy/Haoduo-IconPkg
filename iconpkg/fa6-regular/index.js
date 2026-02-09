
import { register } from '../core.js';

const lookup = "AAAA74kYpBghGgBpzqVRY3NiRDiVY2dlNIU1UUGbZAJYIwJLARsBIwkCwAIWrgcBEWFCB5UBBQQBnggFAyIGq0eWAxUPAliky+UtWpXSvkmr1JtSHLF0Q4S8Lj8cVSztJOevBNwrsL+bhPOW5dl1N9dIgmnslf4/ouQTlYzm9DJt5gmmuiUPhacd8eJ8IQprTdA70bnTrV1pgHHzdn09jqTk2xh02kSoRPKpBzSHorunlXuLoL5Z3nO2QYeM1jmzcQPkxZ7y7BKt4Eo+nBmPlAp/fgj9Yv/Qy4pTp2tgJqqq8tsWDwu+JzEkB4pFAAIABQEAAAAAAQAAABJmYTYtcmVndWxhci0wMS5zdmf/////AAAAAQAAABUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "fa6-regular-01.svg": new URL("./fa6-regular-01.svg", import.meta.url).href
};

register('fa6-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
