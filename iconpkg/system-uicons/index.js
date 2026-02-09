
import { register } from '../core.js';

const lookup = "AAACVYkZAa4YVhoRWzGrWCtjdVNHB4hVc0IydUNDZYlEGENCejNmVTWJVRVnhmUyaTp1c2NieUNyVUI1WFwDbGX5AQM9GAIXPfsBGwIBxQECHFIQCQYTGLUF2QIIDZADCAICCqkp2QMDAgJvCwJRAaINwAMVCSK1AR5n0wQNRQL5CBH/LAIQxgEBMAKKAS6ACm8HCiICeAwCAQJZAa77YLv5qzDHFEXZia9Xf41DmoeOlgy9OCW/hN2n8hHSK6qNpoynzhgSg7RW5LIsW6rofx0euPxs3QXi+6Cksp+pc5UdBOas1oAe85OVyAMTvx++3QfOcp/sQz5fBximG500FlkGnEiwlLQdam6K/jidY4YLSoJ40JIVsN8HUGucoIOU7Bsoz20qvtmJOQfQYv48Ap8JpdA2xYfyg7XRZLr9O62+thyrrXETVHzgMTGhYX9th22wErFkv11mX+Z0l5R+sJ/+oUSFIOsHcxdxoERLuRuGuUxEe5aN0LniHRREq+SgkF/3FG0UIFp1YHoNxA0sym3YrIEUtNGm6rpWY4/XIy1cmHiBlTC/wAyE+Nx1H865RWFvl4usiZG1i+83BxZMqXAoduSiU/Ron88VXILEnv3gNMKqOa3HejM28+rjZ2UqKODV2jSJa+hEr0bt/T48grVzoCTdQ/UJvEVfp2ka59mGi+XC8jWUIx5iTdgXJdBcMB3sfFLJMNnl7BxAaIchdeg8qZCVvr+SAwa+6JGs2cSBdqPZchymPwoOAFtnnCl2D5Wgoq/2uAWsQObXSwACiwACACAQAEEEAAAAAAMAAAAUc3lzdGVtLXVpY29ucy0wMS5zdmcAAAAUc3lzdGVtLXVpY29ucy0wMi5zdmcAAAAUc3lzdGVtLXVpY29ucy0wMy5zdmf/////AAAAAgAAAGwUEEAEgiFFUAURVQQBSUBVUBURAUUVARUBBRWQJIBBVFFgAAkZEEEUZQAhJlEUEBFFZRAAERRVRUJEFRRAAEVEFUFVIhQRUGFkCRJFhQICBQSEUABQYCVBFVEFRFEQVUVFFlAAVRVEFkAARQUAAAAA";

const chunks = {
  "system-uicons-01.svg": new URL("./system-uicons-01.svg", import.meta.url).href,
  "system-uicons-02.svg": new URL("./system-uicons-02.svg", import.meta.url).href,
  "system-uicons-03.svg": new URL("./system-uicons-03.svg", import.meta.url).href
};

register('system-uicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
