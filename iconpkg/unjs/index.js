
import { register } from '../core.js';

const lookup = "AAAAZIkYPw0agdLAbkdGcmN3YzYDTJABBAEcATwVWH0aAgJYPyuCMtwjxNY7yeKSFbug+WTEsmStB4CL5ERJzCfdFVcyf47LVDbyCla7fA0sx2yhErHRvz1oMnfFMVd37vQaZUIACQAAAAABAAAAC3VuanMtMDEuc3Zn/////wAAAAEAAAAIAAAAAAAAAAAAAAAA";

const chunks = {
  "unjs-01.svg": new URL("./unjs-01.svg", import.meta.url).href
};

register('unjs', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
