
import { register } from '../core.js';

const lookup = "AAABlYkZAR4YOhopTcxMWB1kKFJIOGJaN0NnBHSURUc2QjszRVIyZagSs6ZxGFg9Ca0B4QI2PQIMDizgCTS3AggDKgeqAQO6ARzyDQsKSQITAwEB1yQDAhoD3QEDBBRvV/cCAQmEEjqSDmbGAwJZAR7F5gMg19nSfweUOXMCQXPPtI2X9oFvJkf5AakcUM/RnFeH3T7VpmNGMIN2RyCbbdEPAVY85Cgbvnr4zWCDHsnS7kDKbRAWIbas+1V+JJVfF7fvb2GLDxgNiGCkHtolTq+ztq03vyoULoz0onMeMJy9HlKHvXh6KlEh0+PYJAFbBvfFcaiJ8hO+LaBI+1GE8OGnnaPTr3G+Qnbu22nem9+1TikVWv4Y940tdZKTZ1XzlfyUehF1NCIuJ7m+Bf/6NjlrHq2scu0kJn9ttTKcrJaVqRtRCI6bI2lhuAywRWwyXTlELL934+mogJkGkCC2zp8qx6eOFbvJY70dxZKShL3whWGMvEjDsNWXe+0y1k79UD/911GYLMiD8omQ/7qzSBgEMAAIAUICAAAAAAIAAAAOZmVhdGhlci0wMS5zdmcAAAAOZmVhdGhlci0wMi5zdmf/////AAAAAgAAAEgABQEREAAUQAAEEABAQQBBBARAQBFABUABREABVAABBUUEUEVFABBQEEREAQAABBQVQBAUARRAEBRQABQABEAAAQUAAQAQAAAAAAAA";

const chunks = {
  "feather-01.svg": new URL("./feather-01.svg", import.meta.url).href,
  "feather-02.svg": new URL("./feather-02.svg", import.meta.url).href
};

register('feather', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
