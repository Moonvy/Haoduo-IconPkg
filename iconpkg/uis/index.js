
import { register } from '../core.js';

const lookup = "AAABCokYvhgmGuEInTFTVlRIJKQUVkU1R0NGZXYVd5FlZlgiQDkJRvADJA2oAgMYDxcPAwUmBEIFMFAbNBJvRYwMDwUcOwJYvhWRiRErQA7LbawqqXZa+EIlcfAjA/FvZMmVL1gHwip7OBFjHunkVYLz3HGg8sl7v6wu6BZ/Y3nSYLY+9p3zB85VSsXZ5FCNEdeLEVhh5n/3h9zvW1mrTZd0mtPoG80N75jXfqCVbAc8fraHYMABNdcPG2lEJo6VHlSDx3j8o5tQu5Eka72Lxp8xFQTV14H/YL0g84N7feNIcp46vQnLhqOZp4Ezi7k8j1wRIxHKLcZT71Z6BZ3NsqW+kXBsQUNFoIggIAEAAAAAAQAAAAp1aXMtMDEuc3Zn/////wAAAAEAAAAYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "uis-01.svg": new URL("./uis-01.svg", import.meta.url).href
};

register('uis', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
