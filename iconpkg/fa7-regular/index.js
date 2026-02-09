
import { register } from '../core.js';

const lookup = "AAABgokZARAYNxou+0DCWBxWRJdlMhcmNyZIM4c0dFcmNVRFp3ZFFEZFSFUFWDoHKAgKtwKZCG81C0O7AQIwAiK4AgIGAiMtCwEClAGBAQg3AQoCAiMpECC9DxAVBRENARYbAeQCCgQCAlkBELkM7dC/7JZFVebLgpPRlv+i2tA3h6uGrAeL8Sfvv5gbG8v0pP6h3RaFRHwETb5zD3CCpyRVJgJr2Q+8xYTTrWq+iivx63YnuI+9HudpJAkYJIdn4ggKLSBtXQMHcXTHtvNBoiVD8bxZ5EjNOUhwf4oElZ4DBr4eSnP4LCUd2y6edL8S/VqE4knWjoDzXuc+WdsJs/0T3oyxdq2nqhevNKrN5GN7m351pgoIYv+oa9RPoOa18SfasH7VEnSnP9LlMQqBPXqV0HdSy0RplmHsWgubqayvlRzgien0XafUMj9Y0vK6r5xTcdwqcM9ga5SBO4ybldNy40on5Su/i4UWsPLMu/KtK9d9ITzsGRyi5GCORwAJAgAAIEAAAAAAAgAAABJmYTctcmVndWxhci0wMS5zdmcAAAASZmE3LXJlZ3VsYXItMDIuc3Zn/////wAAAAIAAABEAQBRVAAEAUBEEQAEAFBEAAAAQBAAQARAEAQEARAQBFQQBAABEAARFBAEAABEAAEBQEFEBBRQEQAAQAQAAEUBUQBAAFAAAAAA";

const chunks = {
  "fa7-regular-01.svg": new URL("./fa7-regular-01.svg", import.meta.url).href,
  "fa7-regular-02.svg": new URL("./fa7-regular-02.svg", import.meta.url).href
};

register('fa7-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
