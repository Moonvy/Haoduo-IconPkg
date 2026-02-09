
import { register } from '../core.js';

const lookup = "AAAAh4kYWRIaFxcyN0kUcil0NXRbYmRS9QH2AQECaQEICRWEFwJGBPkBAlhZ3hMC/0Fg+F2Hvht+14UDHp2DbCEYhmwpbVHOpvlpQughmF++RhUzrHpRoc9gG+9S8lAkFu6vI2uhLEK1PzqCNW347sm/WpXaQZiYC70wzXywq5AArU7R8EdDB0AAAAAAAAEAAAAOdG9wY29hdC0wMS5zdmf/////AAAAAQAAAAwAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "topcoat-01.svg": new URL("./topcoat-01.svg", import.meta.url).href
};

register('topcoat', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
