
import { register } from '../core.js';

const lookup = "AAABZIkY+hgyGrf96BFYGUlXI1c6hDR8SjVDVnIVNDKmRlSlElVjVyRYN+kZ1wECA9IBDNUEAQm1BwIBrQ3bAeEiAz0EBQR+IgGVAgINAgNI2RUDBgMSpB4BLQcHRbEBHBkCWPrgXV0su5dBWk1U+7j7F9S4y5vEnVhAlUb9N0p/1+GU2sfIi3XP6d12FsfagCl04Cgal8QnGe6pfTwXyNvVZ3f0SNIn696l3LGg2w5ifYmm7GI6t0R2sHv8YzWcks+CftB0FL+hIczzlVucMY+T17JWFKR+s/ZzM20jClNf5Up15XzRxaSOr8mYYU3DtpizGcgPQ4t9jiGsV9BAmh090RgIb0mti1wDBYmt4L0npp8Fh1CU6Onx1fdXxnNl0LfPsWZhAfg1YUIqNM/PyPjLpWuPibPNU328Z++8N8EUDY+CUXs1p/f7bymrna2BvGzI9M4kexJp6bht/HStRyIAAEgQAgIAAAAAAgAAABRiaXRjb2luLWljb25zLTAxLnN2ZwAAABRiaXRjb2luLWljb25zLTAyLnN2Z/////8AAAACAAAAPxAQAAAAAABAQAAAABAABAQAVBEEQAAQBQQQAQEBBUBFQAEBQAQQAAAEAEAUQBAAQAAQQAAQQBAAQUAAAQAAAAAAAAA=";

const chunks = {
  "bitcoin-icons-01.svg": new URL("./bitcoin-icons-01.svg", import.meta.url).href,
  "bitcoin-icons-02.svg": new URL("./bitcoin-icons-02.svg", import.meta.url).href
};

register('bitcoin-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
