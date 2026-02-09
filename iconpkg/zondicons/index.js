
import { register } from '../core.js';

const lookup = "AAABqYkZASkYPBoqnU4yWB5yM3KTZZhmc2hSSZImNnZSVmNhQ1CkMiVlU1W5cjNYRQEOAgSjAgfACwYC5ASPCREqBhKIAioUozcKBIIHFgEBAgSXARmsAQkCGZIBBAUvB5YBAQs9AgsNAwwPCsgRloUBAjABBQJZASmrFBOaF/n+m1YR329i3g1pxDlkWEeR74UH/Y7TgwvilhXajqydmg2wwR8q9P+EAZh55TTA6xIjOWFh0zxEF3tAp001okzSiJZsPTYa57NEVUJ6aPqxnXHnM/218vO+mTbzIpnxp0YhYL/3RhWTJhkYagJxuiJfyMVUzjudszuk+nAlkMGRrYDsxD8jE7yozr7ovGl1YW36NAMcz0pZERx17k1+Pb84h0OL5GgFcCCsl5ymKKEt2endIo3yvoGsuRpAIWDHhzOuDie3uchKWxun8HZbucYU9FMwdT5rf1TVDflQ+0lodTX4CV0ce3LogcpSndOumQ3/fFo2Z6y6tXOGn+aRVe0dERrsBQ9ylYJdgXJoYHUdtrl86MnJsMED6TZ6+KPROASnK75ICAAEQBABAAAAAAAAAgAAABB6b25kaWNvbnMtMDEuc3ZnAAAAEHpvbmRpY29ucy0wMi5zdmf/////AAAAAgAAAEsAAFQAEAQFQAABAARBBEEREAAABFEQUAABFEQEABAVBAAAARBUEEQFVQQFQQUABQBFQBRBARBERQAQAEUFAFQFQABAABQBQAUQUQAAAAAA";

const chunks = {
  "zondicons-01.svg": new URL("./zondicons-01.svg", import.meta.url).href,
  "zondicons-02.svg": new URL("./zondicons-02.svg", import.meta.url).href
};

register('zondicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
