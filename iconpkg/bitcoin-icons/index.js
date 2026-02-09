
import { register } from '../core.js';

const lookup = "AAABY4kY+hgyGqn1y6lYGVRFNUKJVEZUNaNlU0KcJyRTRFlkZGRlWSRYNgQ3AQ0NBgYJsQS7BgYKMhAaAdoQKAkCAQEMs7UBywmzBwEjBTSJGwkBMweUAQkMCQzLBgYGBAJY+g0UgquLF5WPNSecr3/RRp0PyNDpw3NYV0r7pHbblI/P4ER7lJfgvO7ISRTJdJzdQF83GCGtpgWVKCEDwYIpdioaXchvpbM8oMz7bXMXxuWAvdtbz+ukuFpi0bNp/c1NneFhztc3vH3PJxncUyzXGVzUdVRAd47EHX7pNIFtZ0hNiQWl9zPPppiy8/t7Vvi3yNopiW/8ASf2uOCLu8uxfQjekvTH6fQjflfISpqt6Me4fa1DJKmnXVMU7zV0DsWsh5jlUNDx1Zth/I/SjmFnvGbVdWKz93vLZT34i9CfrZe/oX10EmNBfJOwClFC7DqJMRY12mu3bM+xxLZHAMAEwAEAAAAAAAACAAAAFGJpdGNvaW4taWNvbnMtMDEuc3ZnAAAAFGJpdGNvaW4taWNvbnMtMDIuc3Zn/////wAAAAIAAAA/VAAQAAAAEAAUABQAAQBAQBBBQBEQAAAEAAARAAQAAABEAAQAAEAAAAABEAAQEAQRBABARQABBAEARAAQEFQBAAAAAA==";

const chunks = {
  "bitcoin-icons-01.svg": new URL("./bitcoin-icons-01.svg", import.meta.url).href,
  "bitcoin-icons-02.svg": new URL("./bitcoin-icons-02.svg", import.meta.url).href
};

register('bitcoin-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
