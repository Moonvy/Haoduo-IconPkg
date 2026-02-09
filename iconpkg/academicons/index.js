
import { register } from '../core.js';

const lookup = "AAAA54kYnhggGs0wBEdQYZV0aZWJaDRFQ0RCNWJiMlgjCAPoCh2NBPoFeC35CJ0E+AgxGAcDIwYBBQURAQwyBQFWGQICWJ6biPGOX6k3AOIF1FhGvMrd8fhbR1oovn34nW7eLU8sCJV2lC4z/uwYQcajtOqVeW2P+Pkm6DxGu4JNmNzv8gakCJplppFUjlD+zsgO2bc8CHYcMp73/h3tUIuvvReG3el6rQaHoeh+yLjp6ceZFf8BQ7OWpBpG+waziw7h4juJQobCDti7r4Ux4T0QVfc54LKOmtjqAnodQcP7g6weaUQBAABQAAAAAAEAAAASYWNhZGVtaWNvbnMtMDEuc3Zn/////wAAAAEAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "academicons-01.svg": new URL("./academicons-01.svg", import.meta.url).href
};

register('academicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
