
import { register } from '../core.js';

const lookup = "AAAAZIkYPw0aHMR5HEczNXdiV2MGTAICBhATJJoCFgQHNwJYP3xorRLixPm7V7FUv/IV7jKCyT3c0ScroY5l1mzdVgegMmRXMgoVgMdkdzENuzYjSXcsGkQ7zPSykuTLxcSLf0JBAAAAAAABAAAAC3VuanMtMDEuc3Zn/////wAAAAEAAAAIAAAAAAAAAAAAAAAA";

const chunks = {
  "unjs-01.svg": new URL("./unjs-01.svg", import.meta.url).href
};

register('unjs', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
