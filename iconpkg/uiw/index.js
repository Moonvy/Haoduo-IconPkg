
import { register } from '../core.js';

const lookup = "AAABNIkY1hgrGjHTDg5WhmdTJyWEciRlJqhkRkRGczViEmamBFgwDY0GFgMEAREVAQiuAgHkAQUCwAFflwLeGghO6AECAwRlAgTAARUEAXoCF0EFhw4GAljWBZJSxCl7CjbRkFb9bx6nk77/txIuHB7Xw/KwYCAwEL6o8lC9Irgb8c5ftvppT9rj065drCZQLxZO0HXLFwLWhWIJ6Gceg/BtsmiVoKSw11OOJdwhgCj+0LRfwPKKXJqVUGAj/v3BpwOJEkk3tkEsOHV6Gw1tYYf08hTWO+Yby0MCIpv5h38a2YSHOcX4nW3htLkpLB5EIeZnOyRLKTy9UdbcUs4djE0GKqEVyQZpGRQq/WByHMKde8poWifZXBdSxs9KM1fv/gsQMLAH+Wym4nG1v7dDfkaAgAgAIAAAAAAAAgAAAAp1aXctMDEuc3ZnAAAACnVpdy0wMi5zdmf/////AAAAAgAAADYAABAAAAAQAAAQAAAAAABAUAAAEQAAABAAEAAAAQAAAAAABAQAAAAAAAAAAAAAAAAAAAAAAQAAAAAA";

const chunks = {
  "uiw-01.svg": new URL("./uiw-01.svg", import.meta.url).href,
  "uiw-02.svg": new URL("./uiw-02.svg", import.meta.url).href
};

register('uiw', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
