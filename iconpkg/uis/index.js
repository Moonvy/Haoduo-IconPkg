
import { register } from '../core.js';

const lookup = "AAABD4kYvhgmGm+BJ1VTRzdKW0NVMmU4dGdjJkIjpChEdFgntwEFJgI1BqkPHAJuLAEBDBdbGowBywMLBxeOAQICBQrvK4cBAxIjAli+5BV/eO/OkZfFyY56YL3pL2NDke/2A51t/82H8DFjlcaNBcal5m8bWNdbewG2VVBTo3vXEaesi48NftyHq/NWcTo88hFcONd5mFUtvx6fIGxIyw/vJLm2LgeesnZ0rGAjlclN9z5+iStKVKkqyvMRFhE1gtdpROgVJaBxI+MO3JmdwtNkgcsHkfERvVjVKoP4HjMHa2xQWdmVQAn8gXCDi75hYHty0gQmhs27mhEbWn+LfUKgPOhBm8e988Cj5EUAAQISBgAAAAABAAAACnVpcy0wMS5zdmf/////AAAAAQAAABgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "uis-01.svg": new URL("./uis-01.svg", import.meta.url).href
};

register('uis', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
