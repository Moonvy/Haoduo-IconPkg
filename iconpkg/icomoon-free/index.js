
import { register } from '../core.js';

const lookup = "AAACpokZAesYYxpxuQeIWDJDUTdDcjgzJVREGGNHRWZFRUdYNjdldjR3NHM2RVZUVFp1iGQkSXRScpVnVXkFZZMnAlhnAwUFTwIGBYsB9QMOBwUjERwDBrACA0+nAQUFE1Y9BhMFogMIlAEjBGMBBxAnKwKVAVMMASEjBhMNhAEQBhUJCeoLBCXVAwQSCN4KCQTJBQUIkgEPtgMNARoinyqBAxIDaQG0BIoCBAJZAeup3xRhIPPO/ECA142UV4mW/VX59Ket89rIHaPKQDgyhXVhFFwSluwc9LpfEhuXTsr+wk2QYEakUKE6zvIDgpOiYJoeuopgw7ldO4V9IwvN+Gqp0P5HQrP291ZczOQqourk6iUSDpsE2B4hbCsmDqdCeMEeLGk6D1TsOgd0IeeOs+jCkOd2XwoilPjFffJlXbvanOFS8Zw0Qe8cCzZODSe2eDDwrOnQ5qiYHUUcpA7Jmvcj5en2mkAdXQWphhUg8spyFpjx8+1JdV5XnBhgj63sP/6VG74HuPdBvqdc3L/ysbBdiaO+GaPPrn/CZzgyUV2WtORRLctYErJdk+ZhC4k0mc9vnHl7Ru5n1oOgmWnGQhV2xQ9Enea7IK+MWNnlaa1emEtG1y3AFsBclSHjUIJSbWGDHrXqTQHWZ5mPrxt4a+/wh4792gMWVlNab9CSISa4AgE9YYdh9S3LrarwNXWkZbZamzusyqcs2RxGdntlR5IbqT6PNPVpJRGaWlr34ZefMNXXXa0tQT4yNgDkPVlsYPp+QHQK3ozrsPqwgycw8n01icsFMN3VmTbhKU5WRv5dh7PHHSxQO1gtsI+Lc7ZQ58lrMcsPpkgGO6VxsJRFi4zISgutp3h9gZTHEFLtceYJotoucJ0dCa+Pu00EgSAEgEAQAAQDAQgEAAAAAAMAAAATaWNvbW9vbi1mcmVlLTAxLnN2ZwAAABNpY29tb29uLWZyZWUtMDIuc3ZnAAAAE2ljb21vb24tZnJlZS0wMy5zdmf/////AAAAAgAAAHtCUpJEEVgWIRYVRYUQBSZlGSBYUEQVEBIlFBFAUEiChClCAYWoFgSFJpEUEEBhoGBkFZJCAZCAJoUAoRJZgFRZZVQWQBCZWRVUFmYUoAFIgBGBUEikACEVEZVBQiRpJBBCRZREVpphFhRBEhBSBVEFFlVpQAQkEUFQZAIAAAAA";

const chunks = {
  "icomoon-free-01.svg": new URL("./icomoon-free-01.svg", import.meta.url).href,
  "icomoon-free-02.svg": new URL("./icomoon-free-02.svg", import.meta.url).href,
  "icomoon-free-03.svg": new URL("./icomoon-free-03.svg", import.meta.url).href
};

register('icomoon-free', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
