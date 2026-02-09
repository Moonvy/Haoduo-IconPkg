
import { register } from '../core.js';

const lookup = "AAABZYkY/RgzGj548bBYGmZpJ3NpQnRJURVFFGhkVGSSckVFXJRyNjICWDRb/Q8cUgc6JAIKB50EhAgDHAUrAQr1BrkBCBcMJpoBVAMdqAEKFjLSCykG1xqSAXcDAQMBAlj9Ek+fvZ+WUgUod3CRp+BUwi65MGL73bk3Ic6ssjaoAaQXK/jNmhr3RiL6YuOp2B+wTac7/Y6Dc6aizFUM4dhhRySc4O3+VrCtWpw97zIk5NeKKdfbn97XHrc1+lSyd9GkIekv2sLei9+GhIpOo94T7Emf7VZI/DJeIXZXH/SE5uVfvJtQQCJQdSSLqo+G7DeCEyh7mbl7yROhv1NDqqgqJ14r+wCppcV3JjxcpH+gWfVs/YPlF/b1CVerlD7ADjr8bcaF9XZeSfsS9DhBBGad0vS3wDuOLgK1g0xeSySj77cwf/+bc/+6MwYce5V383AU8M4KGLpWebMVQ1pRNUdiAIlAARAAAAAAAAIAAAAQZW9zLWljb25zLTAxLnN2ZwAAABBlb3MtaWNvbnMtMDIuc3Zn/////wAAAAIAAABAAQAEAAQAAAAAABRRAVAQAQAEFAEEQQBBBAAAQEBQAAABEQAAEEUARAAEAAQEBAEEQEABBAAAARQQAEABAQAAAAAAAAA=";

const chunks = {
  "eos-icons-01.svg": new URL("./eos-icons-01.svg", import.meta.url).href,
  "eos-icons-02.svg": new URL("./eos-icons-02.svg", import.meta.url).href
};

register('eos-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
