
import { register } from '../core.js';

const lookup = "AAACGYkZAYEYTRraftjUWCdnN1hJNDZkYjNHGVRVI1EmJ4FiKVIURcUEhWxoREekJzlEQ0g6ZwZYUlNeowIBjwEWuQoGAwQQCAGTAgMkBe8BAnEdDQMJBwMLBrABHxCuCTwFLiRT6FECC8UGrmTeAcABBwcItgQICvgFFOMEAwUCA68BFdgHBLICERoCWQGBZmln7Tb9AuZrIqNHgheInYsFemkPfmiW14XQXMlBQNMQYMvPetMcLo8vp69Ylb3JRSGCH2D9hY6YfR8DF15bphb+pL5Y28GXOa+xdozWENJQSnK9MkKSvxWyumG/Fz8O8hGPq4bBUAn+XlFSuyosMnRGFgQ+bFnymOtU6MRkuv3yu7e2web9oHWOqY+CrDEVuTsvnlWP4s6BerTlCTunB/LmrYzF20ocL3sw5UGLbGxkldFiOPKpqVxpnKLBBSa+B1UXsTujsIVtk2wYjo7KkMOVfFLzvz4ZUbODZa3kSD2z1tuBZXINtsxoxMzqyMUt5NGHDnLsw0m2dUmKSQoU7vsbiD+/X7WS45WS6wVCPbkC1QX5AyxW9MwznfZRHEDqz++VnNbZbXcWMwefY76NIgxOugEe6xCsqfDhrFXkljBqUWtzxazilzkPmZSQf6D3j6nmMBkeQiUgOmylEq9VCSp/HKGskF0hYPtES7BfDYEPlXIeT/7tc8KbGey+nxbPqEoAACKQlgkCgAIAAAAAAAIAAAAYaGVyb2ljb25zLW91dGxpbmUtMDEuc3ZnAAAAGGhlcm9pY29ucy1vdXRsaW5lLTAyLnN2Z/////8AAAACAAAAYVRQURBFBQUUBBURFQQUAVRAVQVEBEUFAQBAARAAARAVFERRAFQQEFUFRFAQFRURQBVQVARAFBRFEVUEQFEEBFAUUVFQEUAUFUBVRBQEUVVAEAFBAFRQRERFAVQBFUBABAAAAAAA";

const chunks = {
  "heroicons-outline-01.svg": new URL("./heroicons-outline-01.svg", import.meta.url).href,
  "heroicons-outline-02.svg": new URL("./heroicons-outline-02.svg", import.meta.url).href
};

register('heroicons-outline', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
