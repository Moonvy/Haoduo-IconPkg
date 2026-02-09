
import { register } from '../core.js';

const lookup = "AAAAdIkYTBAamWD8lkhFaDJEY0RjpE4BvgIHBAkHCREDCBSKBAJYTEBqmM19xgswHU6hthMSuir3zJjRt1o41bSvgFPzOu+D7EID6PAMoqSF9fyPbyEeiJlZm0HyBeGrLm+5ZbKJR1yiEGHCdsMlUbaLQpVCIQUAAAAAAQAAABRlbnR5cG8tc29jaWFsLTAxLnN2Z/////8AAAABAAAACgAAAAAAAAAAAAAAAAAA";

const chunks = {
  "entypo-social-01.svg": new URL("./entypo-social-01.svg", import.meta.url).href
};

register('entypo-social', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
