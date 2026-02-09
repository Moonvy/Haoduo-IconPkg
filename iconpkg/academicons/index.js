
import { register } from '../core.js';

const lookup = "AAAA4IkYnhggGheaCJBQdFJhKDY0dlNGZYNVaFNzdVgcA1kokwQjBgFvAkk9DP0BBQsBlwQNCxkCrgIOJAJYnvtu+P6j6IksF4aGDpYdiNwYmILDyKQd7QVPmY7hjrje9zmvUKb+JlXUMzzZLfmafjK8u7Ix8YtpQkaLxjxBCF/KN+q9eUbCs1p2O3roCMd9qd37vh5Hm20GTT0Vle+FQeKtlLTxVKSVKBp6dp0cZf7hs/Ke2C73BvjprLuPDo7sof8Qg0PYmpHdBuC3RuoO6YfpWAHiUK8C+MgAzghbRJwYEgAAAAAAAQAAABJhY2FkZW1pY29ucy0wMS5zdmf/////AAAAAQAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "academicons-01.svg": new URL("./academicons-01.svg", import.meta.url).href
};

register('academicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
