
import { register } from '../core.js';

const lookup = "AAAA74kYpxgiGmnoshZRJpZhhVVDJFVXN2RFQXMXSmdYICxeBhgJ1QIhOgUMAw1AHgxfCgZACAkEBCXJAbcCJXpWAlinOlPxvERUpnNIwwEltu3v1hDignhGF3cZ5RmQaU958ATYHM31yLH/uwVkezjNpYFAf7Msyp8oBnwcloFLSwisTVPB5J3douy3NzrHKfeqfBlHhVusPqq0bDcI6xMhsWSEIBGot1OLlJo0vD3Hi7W20VqpnlHwSYzvR84kKdWBHp2fl0CEtiVnzF51AcCN7P8v5LM4IuP7dxkJCqsRmZAh7wf+gQo++SFFEhAAIQAAAAAAAQAAAAptYXAtMDEuc3Zn/////wAAAAEAAAAVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "map-01.svg": new URL("./map-01.svg", import.meta.url).href
};

register('map', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
