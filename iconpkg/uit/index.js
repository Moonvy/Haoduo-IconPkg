
import { register } from '../core.js';

const lookup = "AAABNYkY2BgsGq8KE6hWJGKRSDKhWMMXW4ZSIYREVTQmloFFRlgvBgE8qwS7AQQBhRzkAh4Cp+0BKuFdB54BugEEEAe0AQoGF4wBBDcDhQzvAxwgAwQCWNgdfu6f9vPcUHSsy7jOJotVi8ZhC0S4OAWaJeS2133zDWx9vhHNh+qLuvM1exxUETuNZAevxefXeT5xIGsEe4egnZHmhu+E41hWYCCbG3AKJpnXzbkJL1wR8XgDYKJASlq2qCqRcjyBA7lYQW2n8u+AVZ2P9/wc6Vv2HqO7bJW9OJmDFUK5ey5QL0FjXwe/fpGp9xFxcGCYjtVjI8Z/K/8QOoMx15dPLXEOI8BTthFN0ySyeenLgKFz3JWV0sgV7sJIKszyM4EWrOgehsc8jvBUBax/P+/XOllGFAUCA0oAAAAAAAIAAAAKdWl0LTAxLnN2ZwAAAAp1aXQtMDIuc3Zn/////wAAAAIAAAA2BAAAAAAAAAQAAEAAAQEBAAAAAAAAAEAAAAAABAAAAAAAQAAAAAEAAAEAEAAAQAAAAAAABAQEAAAAAA==";

const chunks = {
  "uit-01.svg": new URL("./uit-01.svg", import.meta.url).href,
  "uit-02.svg": new URL("./uit-02.svg", import.meta.url).href
};

register('uit', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
