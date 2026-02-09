
import { register } from '../core.js';

const lookup = "AAAAg4kYVREaq0H8AEl2QlpBQ1c2kwZSX14E6E0ZAgYhTosBYwbVBpkBAlhVMUNblJejpjU1dhQHHE8BJrPsGWuc7tUEAbdq8pacb1hADprXq6FSFIFs5lGYNAy0fr6atgc5pLnWorPZAIPIujewa/MbB23R1iAYPAf3frCrhxI18UNEQAAAAAAAAQAAABB3ZWJzeW1ib2wtMDEuc3Zn/////wAAAAEAAAALAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "websymbol-01.svg": new URL("./websymbol-01.svg", import.meta.url).href
};

register('websymbol', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
