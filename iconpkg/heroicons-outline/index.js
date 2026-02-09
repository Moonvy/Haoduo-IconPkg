
import { register } from '../core.js';

const lookup = "AAACGYkZAYEYTRo9zMHAWCdUMWJUQoRlVUZiSGeHVVIWRFaEE1Moq6UlRFZFRaM0NVZWNmdTaQZYUgMBAkULAQYeB/wFBDYHCh0EKO0FBpsCIJ0DiwNtCAwEEx66ARgGkgMf+gIBugWDGhu3FxEBCG0YGh9TBwPkAh4KZwMHBTsuZASHAa0BBLQDEBMCWQGB8xCdgr8c/bsMMJypyayv0bKPm5AJtiHrsTDMj9fEY58PsMUbErFWs/KV1adVVUksiMNAepQVCqzyTx5qbHvbgevhlY6tmFG3D4+7+ULsoJcVj77BUkesp+awGS8XjNIwS61Fvj8NUATk6gW+aH/+v2kunwe6qIsFaVUqWOJZlvL9Qs5yUkG5/uj00WyDPqy21v2S20q/jtkR/gOV018cSM+LF5JnDgMOpo+c5maVVRbCGQJ2LEZE5IJUYB6OCRTTXWDFYPbBOWw4BeLmtjPPkhyQvltBAYaryi3vcvJJNoyhaAVcvXOZZKwcdMlJO7mB1hbtHyVAOsFzhXXLKv07OYcHbea9XJiKlchl49a/bJ6plsygM0pyF43lYrWV23xsJoKOEAlQ96TrMhbE7QcyLyLlxWlr6rMNpdCTw7qdYR7kD/KjQoXMkIHwzzshX+5ta38QevtYTmU+qWSIovsxPX4WPxjsrwLBUam6eqN3Iqm0L16FXhcgGVEfcpd9PVGvdUoUAASQwAEIAAABAAAAAAIAAAAYaGVyb2ljb25zLW91dGxpbmUtMDEuc3ZnAAAAGGhlcm9pY29ucy1vdXRsaW5lLTAyLnN2Z/////8AAAACAAAAYRRBFBABAQRFVEBEQBFBARAURAUFBVQFUEUEUUVRAFEAAUUURVBFABAUQVEQEFBEVUBQVURRAEQBQUUFEBEVFFBRAFFFQRFBRAABAVQEEREBRAVEEUEUVURBVQVEQQFABAEAAAAA";

const chunks = {
  "heroicons-outline-01.svg": new URL("./heroicons-outline-01.svg", import.meta.url).href,
  "heroicons-outline-02.svg": new URL("./heroicons-outline-02.svg", import.meta.url).href
};

register('heroicons-outline', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
