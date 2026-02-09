
import { register } from '../core.js';

const lookup = "AAAAhokYVREas0LUGEmXQ2M3dSSDUgdV4gGPDAkCG6cBARz4ARoBAtcDASkzAlhVa6sbtqPzbAfZnIOkszlbJn5DmtbWs4ewa1IBNTSrbUA8Eg6iGZd+nFiBFOyY8tEUugC+GHahNQdvIJpqB7cElDXxpjfVUQHX5rAcT8iWMQe0DO6590MIAAAAAAAAAQAAABB3ZWJzeW1ib2wtMDEuc3Zn/////wAAAAEAAAALAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "websymbol-01.svg": new URL("./websymbol-01.svg", import.meta.url).href
};

register('websymbol', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
