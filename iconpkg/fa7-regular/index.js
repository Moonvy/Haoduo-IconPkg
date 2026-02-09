
import { register } from '../core.js';

const lookup = "AAABf4kZARAYNxraX6VBWBw3RVakYqclJVZjFEcjdZSVVVMqVEM3NHVoclMDWDcXAQkQEAndEQPNAfIMITECEAIjCXYEAQEDGxW7DALtBj4MGuJOARkEA8QCCgkIGikvHgHXAQIKAlkBEH3e8dWqDxvnrZWJyweL87BPlrPsBq9ar5iw2qxd2l5g0fKMzSfbgufPa6cbReNiGHDW2WuAfNQHHtIL66b/im12qMtzclWVWpaO7+ngJT9xrZsWOcXQsc1KJey9/SSkYys7WASFCYevjkhhur9xj/i+3THxZ+wtHK2/uXCb0Bd/gh7yv+2gvAodUiQT4p7corjSD7xVXUTylWvk83MnlH7XWQPTdIQSlst6LoQqQVMM5gREQzzltUk0qYz+2wlI0z2TGSArHL9p8YondOJgCCYstqJ3CHDHnCtNCje7gWrM0Gn0WXUydKuVFub0P/H/m6yiqgNKhoUhe/1+EiTU5IeLgaenvgrkAqcnoXY+5Z6+RwIhIQCCAEAAAAAAAgAAABJmYTctcmVndWxhci0wMS5zdmcAAAASZmE3LXJlZ3VsYXItMDIuc3Zn/////wAAAAIAAABEQABQQRQAAFEBREAEAAABAAERQQEAARBQAEUFQEUAUAARAARUEBUEBAAUFQABAEUQQAAAAAQAAAAAQAAVAUAQABBAABQAAAAA";

const chunks = {
  "fa7-regular-01.svg": new URL("./fa7-regular-01.svg", import.meta.url).href,
  "fa7-regular-02.svg": new URL("./fa7-regular-02.svg", import.meta.url).href
};

register('fa7-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
