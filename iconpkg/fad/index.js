
import { register } from '../core.js';

const lookup = "AAAA3okYmxgfGtGgQJxQU1N5c1RmWHZjdCkzJYJUA1gdQAcZIekBAgcLRltTbg9FWAEmAlSzIQcP4gkCMQQCWJtNOEGpPhuUci+dNDsckzuWee6Y62gY3T3ZpkVM0FSDkjBR9LypNf48XitJxISfzvktHpJDt+UHjezTgrHiYTBEG8+j2t+5FF0BjIBXgoK+4ZTxaeOGbx76TOfvVro79+b0IhdczoYWMxbtuj9j6R27XrGt4C4qLT73+UkwKSInhmguAq6nc8RD6+9daeV4I70hoNkmiP87lNbVikQBAGAGAAAAAAEAAAAKZmFkLTAxLnN2Z/////8AAAABAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "fad-01.svg": new URL("./fad-01.svg", import.meta.url).href
};

register('fad', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
