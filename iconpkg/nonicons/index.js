
import { register } from '../core.js';

const lookup = "AAAAbokYRQ4aDpgO5kclZ2VTWDNlUC8BwALCARtABkVEKAgHPQcCWEUO5gvsyOXlDsD/sqU57iribaYFK7h9xUzILY45dnUJUTqD28MSo4UTeeev+VXkfyk/KpNAh8EQfay0zaVABbsZJ2GJFaNCAAAAAAAAAQAAAA9ub25pY29ucy0wMS5zdmf/////AAAAAQAAAAkAAAAAAAAAAAAAAAAA";

const chunks = {
  "nonicons-01.svg": new URL("./nonicons-01.svg", import.meta.url).href
};

register('nonicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
