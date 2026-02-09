
import { register } from '../core.js';

const lookup = "AAAA4okYnhggGj9EAjZQV0I2RHREgzS5NCdVVlR1RFgeOR0XBwdBHEMXAskGCAUUlQwBAlM3BbsBJQggDigCAlie6d2LGEaplY4dX5vd2f4mCC0OiYW4w3qW+On3HbTxZW1UyjHh2Ag3QdzCDv8Gj+oe+Lytnb67VTzxpixH6VqkEI5GF8j7UMiZBmn7r0OOrLfOmqRY4U2zfqH+6OJ2DjKedtjebjvURrsafQaYkSiU7zOyhwGVhq/+iELGCKM9AO1Pmhwu7IPHPPLo9+p5QQVb+L2LAoL5hhU54OJ6s1BEBAUggAAAAAABAAAAEmFjYWRlbWljb25zLTAxLnN2Z/////8AAAABAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "academicons-01.svg": new URL("./academicons-01.svg", import.meta.url).href
};

register('academicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
