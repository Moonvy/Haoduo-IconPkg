
import { register } from '../core.js';

const lookup = "AAAAiIkYWRIabHzmxEmFdmhGNFJ2UjJTDcEECwW8AQVdBAEBIEAUARIBAQJYWR4s7xUwbau/UQALUn6vX9G+3p01a2y9R8kz+EJ8UGD5AkGHKaahI7WYWkKtJBMhsKEhrM4WaXo/z4YY/0HXbe5OG4NGYNps7phRlZCCXRv4zei+hfLwAzqYQwACAAAAAAABAAAADnRvcGNvYXQtMDEuc3Zn/////wAAAAEAAAAMAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "topcoat-01.svg": new URL("./topcoat-01.svg", import.meta.url).href
};

register('topcoat', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
