
import { register } from '../core.js';

const lookup = "AAAB64kZAVkYRRrFEE9PWCNZxlNVQjBCGGMlU1ZTdZWHWEMkV4VYUnc7NTUziyIoQ1NlB1hRrRZ5zAGiyQEEASYKAQwBAQf+BAJQHwdNJRF1EJACVFapAuoD2gEMAQwOASoVCa8GhwIcAjS2Ab8DoE4KHikCAq5U5AIBA5AIAQMBDBm1AZADAlkBWeLzNveN6BTsLFnFHk1prbvyXmqItXYefmMwOfOSveH4stJhUKtlumJxYgxRttmTC0xgue0mshXWShL5YBbfXjGElqievfQbXp8SKw34RCIHfhA10g+fI0tUJg1YqILJrTnTvPuhU3NpJebsr3AxF0018QNrVRlerC4h7Rs7bnDcR/BqDIkam8v8q74DwNg8d2sOvZLujQH5igA3bg9i6gVg0D81PYB08KDn6uMuuULmu2jP6/e+vx3aVji23CWZXRu29XUYpGCaffHX9hfzEY+q3jN4jmuSpWu8CmFBmhiYtTDOrdcjMU0ClV+HGxTmIzGni6wtZbycXe4eKhujZFRjiiG4plL44rZGIFI7Ucjw6V27xNolyG0huiftmjMfqSm1Lpj6ZL+55gq7wfy5dkHBywONtCvD7AMcBaF7Lm19vgKfRPBUIdZn/f1fl1sp8Ier0pYx7PJSAEkAhBgAAACIAAEAAAAAAgAAABBkYXNoaWNvbnMtMDEuc3ZnAAAAEGRhc2hpY29ucy0wMi5zdmf/////AAAAAgAAAFcAUEFABVFAEARARAUUAUUAFQUEBBRQBBBAAQQFQRQAQFFAAEBFBAEAUAVAFARRAFBRVBABQVEFEUAEQEBAQEFFFAVUFFUBFUAERFEVUEVABFUUBQREQAEAAAAA";

const chunks = {
  "dashicons-01.svg": new URL("./dashicons-01.svg", import.meta.url).href,
  "dashicons-02.svg": new URL("./dashicons-02.svg", import.meta.url).href
};

register('dashicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
