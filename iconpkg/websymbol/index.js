
import { register } from '../core.js';

const lookup = "AAAAgYkYVREa9sSMhEmlWCRmQkaBZARQA+ss9wURAhAKG6EBCAEDAQJYVe6UUb6XNdnzBwEYDLRr1bA1dm8UB2s8fpq20UNtEtbWqwejJvFb8iCBpKu5mNfmomyDBOxPNzFqljQOHBu3NbP3mrBYprMHQAA5h34ZoboUyAFSnJxDIBkAAAAAAAEAAAAQd2Vic3ltYm9sLTAxLnN2Z/////8AAAABAAAACwAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "websymbol-01.svg": new URL("./websymbol-01.svg", import.meta.url).href
};

register('websymbol', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
