
import { register } from '../core.js';

const lookup = "AAAA5YkYnhggGjS5oMNQJGVWVzQlcmOTdbVnITeEU1ghCAEFI1NHRwQDA14DMQLxAxaIAgqZlQEtSJEBAgrNAwEUAlie4Rg8/pgxspoBhrvdfjlGQ6/ctKzIqa9u944m/redxvnh6U+PeoXY4ujIVbymmgbY6paV997oyqHHR5nUBgiCww4z+BceEIuedhzxO60G++CVpEEos1SO/pEyFX0ODpTp6h16RoYuULv/pCxfW3aj8kKLLbMaZYniUGnsNwha6Zvxh20CiPuOWO+++AjCRkFNBfjtuIPdPXkA2R29PM5EAA0AAwAAAAABAAAAEmFjYWRlbWljb25zLTAxLnN2Z/////8AAAABAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "academicons-01.svg": new URL("./academicons-01.svg", import.meta.url).href
};

register('academicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
