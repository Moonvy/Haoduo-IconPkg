
import { register } from '../core.js';

const lookup = "AAAA34kYmxgfGmkMelpQlTZnJWVkY1WFUmVlYxV1A1geAaABsgETRCEGEDABhgEDFuEBBg1EYgURBTMPCzkKAlibp+YT0IJx9n6sQoj9XI+Ug9gh8qeMRvKpf0hxZ9Cy+kvLQ28qdKKmyFNQfSZdXMmb0JTGgbgkobbPwnBH08tUas06g3jGAXbWR4jKxiw8KrmOcLKwt1+0EgJg8io1cb0QQcDs2GcAY1HLt6IMGa8NrQ52OcmuKfcPUk6jHmnwEg5CuQU8XrK7UY4vsN+hst5cw51gta9lSO94VzBEiIQACAAAAAABAAAACmJ4bC0wMS5zdmf/////AAAAAQAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "bxl-01.svg": new URL("./bxl-01.svg", import.meta.url).href
};

register('bxl', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
