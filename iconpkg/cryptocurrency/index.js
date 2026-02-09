
import { register } from '../core.js';

const lookup = "AAACl4kZAeMYYRrByks1WDE3UFNmZCZXFWYkMzYyNUcyVUVpWklIRoRESGZjRHaDVHJFNmc0dGJoRpmGNag1UjYAWGHdAQEOHmcRC7ADGSMJFgoxAQMEZwEDRAUBLCgMCqEEI6gOBp4DE+cCDCMUBrkDEwvDAgZ/BQgOAhQPOgO0E0NPHAJoA8sBNQUDXz+UBVcEGekXoAxIlwYQBIIFt08EAiYDAlkB47yrbojMsMhJZzL/t4WwPJ9bD2H+G7LmEPAonD/BCM8pHU0xuX3Odjo+N232+iQG1Y8uaSk9IZxax0V1WYUvk6SHk4ZYAe+4v4mr7C4SdDyohWSNEhinCq6fnDFjeu/vJ5pBPDqU1B+sR2FXoewZzySDWHQtukTJ8uZkhww24ghNkHvB8zKhqwldkUf5bA3oAioxFkbZE0zf4QvrB9ua856ySAvAcNhUthCByeTfHsw4XviBuIjS6bDs6lk0u9EQV3JDaVm+hcHjL0TeFwdLnaI1iFMjrmTvCLnGqH5an3QUC5Zy1+o3nCl77uGv9/GFRV0pqpACVz81RmZjszEDFvJokPCBFBVRvIOtyffFXRmibY942K7wfQ/KX1AFycvGbI3u6YReZ78zw1qdo3JkqloyQ+brYGNHnQXgb48YT0csMazEl3xIcWcCDwzbc2kb6OIOEmrw953hqdOo++DsfJXPccYtEaHLKhq/n3iW3SDC14f71kraCeJqlG0RIqcGq/JYjDCtMv62sVUHB5MO00un/YV/AQwYt80TbG0jzhn8KfzkqTOBvsIjk/ZCzOiUETbCxU28ccbKkMARyjiZDhY83VU0F0R/6x9t4yKVkVuUi+GOIE6sCzB6aOH0pSUN6Wk+G00UiIRJAAAAQAESACgBAAAAAAMAAAAVY3J5cHRvY3VycmVuY3ktMDEuc3ZnAAAAFWNyeXB0b2N1cnJlbmN5LTAyLnN2ZwAAABVjcnlwdG9jdXJyZW5jeS0wMy5zdmf/////AAAAAgAAAHlaEpVFYBlQBURBABlgUlEUJAJBUZQCQYWAqAJgAiVGVAlkUBFpAFlgJEUEQUKUkUYkFQRSSFWAUVGUkqkCBkBRUJEQQhECYZkRQAYURRERAVEWgECKAQgIpBSBUGVEJVUSJRhUaFRhEaEYEiRQUIRGEBEVZISVlVUJAAAAAA==";

const chunks = {
  "cryptocurrency-01.svg": new URL("./cryptocurrency-01.svg", import.meta.url).href,
  "cryptocurrency-02.svg": new URL("./cryptocurrency-02.svg", import.meta.url).href,
  "cryptocurrency-03.svg": new URL("./cryptocurrency-03.svg", import.meta.url).href
};

register('cryptocurrency', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
