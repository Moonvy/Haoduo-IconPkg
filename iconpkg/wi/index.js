
import { register } from '../core.js';

const lookup = "AAABRIkY5hguGmVDAx9XJWNTUhNmVXRVRmRlV6NGdgOoOVR2N0RYLwQDASQC4wEBDQKBAUEeaNEBKCAECAYNNxxHAQI9BgN3U90BvAqhAg8EQJ8BmQECAljmk7Wkj3rJuvzWBjg4fvFGjVB9nkwXW1o+2OEqg80o9nj/ZZthHx5zQbdlvu5/1qoVQvKEScGsrYLcuomVc9jRR3LvY74kmD2pxFVoJ1lnss2tsd95D7Q5UHh/SzJkPaE4DjgPPPZ8y9hiAtICw2rpXDOwoBAKTxAlBx/6na+Kee1NVr9fPz8xzbIE1yLlDqy3jQ7dJiw67nqN0jl5skugBt7ZjSx+gMg2kOoH1y6wXeSzP6lVInJbGFwbmu5Mt6evQTyoIMoAV44weWuc6uUVSPxhWZaS55TB7ba/0qtUGhfCixUqXflGAEIAACMYAAAAAAIAAAAJd2ktMDEuc3ZnAAAACXdpLTAyLnN2Z/////8AAAACAAAAOkAAAEAAAQAAAQAAARAEAQAAAEAABARAAAAAAAABABBABQAAEBAAAABAABAAAAAAABABQAEBABQABAQAAAAA";

const chunks = {
  "wi-01.svg": new URL("./wi-01.svg", import.meta.url).href,
  "wi-02.svg": new URL("./wi-02.svg", import.meta.url).href
};

register('wi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
