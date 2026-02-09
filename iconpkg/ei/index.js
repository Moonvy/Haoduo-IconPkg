
import { register } from '../core.js';

const lookup = "AAAAbYkYRg4aMfTtu0dBZWZhOFVZTgwFC4gBEjT0AQlPPmtHAlhGaBXpufPFQIL0G5Kf9WzHurhZYIwZlTWm6BTjz6zyh0Usswcet4zyHV98Nwe/P6r3GJWpGyJ0flJfOqBsvR5Ec+qoSDBtdkJBAAAAAAABAAAACWVpLTAxLnN2Z/////8AAAABAAAACQAAAAAAAAAAAAAAAAA=";

const chunks = {
  "ei-01.svg": new URL("./ei-01.svg", import.meta.url).href
};

register('ei', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
