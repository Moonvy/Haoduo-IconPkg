
import { register } from '../core.js';

const lookup = "AAABkIkZARsYORrfBcMfWB1jZRVkZYInM4pVFUIkaINSVlpjIpRYdmNEYWVmCFg7Az0dcAMOFw8uAzqBAQECAqNHgQIQBhgBBAUC4QJcAY4CBHoT/AgJLgIE2wl5A01eHQwFkgIEUFQYpgECWQEbW0/ArjLDDRXhYJTBrdLuN5gcORi9/UMjsDlgX98gRPkvF61r2iZOVikPuyFgaTg6t0MdI9QDmGCtnpQdZ8O/LVA182y12eNnR/L+DH3sur5D6zSkooQ/kbFHlLm/5APRVyBpwvd+rJUCFNfX2x1VZfTaLqcQaCwLkkMltBNf2z06fdPpOWsAJy4ZCrNH884mzot/Ulypzf5tLotMpe+HMM20rBIaFBc7O06ZVr9thrpxk0QR85wxHVwHpI5fBdNItArII2njldoVqxbVdnUH/vIs8DTIvqxwUsSHEaFW/h0btwIlokbWwzTxG483/yZ8ye0Su5K2NtuZjJydQuafC83LAJxavwzwf/JD7XOblomPcYi+CQW9ByxbY0ggACBAEEEEAAAAAAACAAAAEWZvdW5kYXRpb24tMDEuc3ZnAAAAEWZvdW5kYXRpb24tMDIuc3Zn/////wAAAAIAAABHAQAABAVFEBEBEFBAEEQEBABABAUEEABFBAQAEBQEQVAQABAAQAEARVBAAEBEARQAUUAERAABAAAAAAAAABBRAVFRQBUFERAAAAAA";

const chunks = {
  "foundation-01.svg": new URL("./foundation-01.svg", import.meta.url).href,
  "foundation-02.svg": new URL("./foundation-02.svg", import.meta.url).href
};

register('foundation', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
