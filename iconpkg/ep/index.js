
import { register } from '../core.js';

const lookup = "AAABnYkZASUYOxp6wlCLWB5mlhY3dEhEQjtlMUGFhmQmdIVjh1VEYxZURmY3NANYPQVyKZgFA8IBATiKAwkWBQELnjcBAi8DMQuRAiqnAQQEH0cQpQVGRJcFDRoGDQVVQgUQLhucAb4BRwYBCgQCWQEl+NIbM3ZjJ+RzT+G7JskUaf6tsBKfuaehbRev1BMl/PMK2+n7rRF6tEnGykozv3UVFLeVcpsAxwISrO8r71aoYKel+RjjMoPig2zOvGfmDfQRg8ByjfT8B8GOUEfnhCx1lPAWHjmDCv4XAfdFPMu+sbBvX2h4G+Z100a/b/tS3GB6WHRpsB3yWpRbhtpe18cGVKXHzxn9zNneHgPTvZXW+Xl/nbI22R2nMYouxMKg8pasvlptx2Sd2v0qNOVpoocqLRvqOyUOMAlWfABe2NxT5dR/Dz34EI3Qznk4B7hw337TCDlbj1rLZ0cHoIi9IRe7ehVhmbkAc5XIsX6XCfgmypCSNkm2tUus9Gh/QaEGmdeen6ZXS605QodwCVOnyK6hXLdRxnFIIAFQgBGAAAAAAAAAAgAAAAllcC0wMS5zdmcAAAAJZXAtMDIuc3Zn/////wAAAAIAAABKEFBFAAARUAAQRQRQQAAAFAAQBBUAAQBFQUEBQABEQBQRRAEEFRBAAVBQAQQAAAAAAEQERQBQAUQEEEQBBQQQBBQVAUEQFBQABAAAAAAA";

const chunks = {
  "ep-01.svg": new URL("./ep-01.svg", import.meta.url).href,
  "ep-02.svg": new URL("./ep-02.svg", import.meta.url).href
};

register('ep', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
