
import { register } from '../core.js';

const lookup = "AAABO4kY3xgtGsRscdtXh2dExnZGNjM1BFF1VlMiszVEY1dlVQZYLWCvD2kHZOU4LCeaAQJAAgMCFQ8SBxkGCgMKAgSOIwoBAgkClwHYAQoIDE0VCQJY3wei/xFra61tXYm1ubdCBmwRYENtpYi/P44wMQUnHRqHjJ+4ndewF2m/2nZc++bANoUWI/11v5vIowfOQipEs2AqB0d6ZYrW/lcBMMdCR2EXPO+iVkarYUB0tiGM9J1x8paY76C9laH+0OKc07qFTA8MugxKJhnXNYGM0vvARP9bPBe6CgtMKh4dhxxTjDGpkpMguTS+xN9wZSTSySfi5HvAdjQ2A/E3dzkwp/CEO24sJMOswp/7OAEb635BkNEt+g2k4h0zyc++rMyVcTva01Hy88HB76p6xDhcsBpz7zVGGAAcEAAAAAAAAAIAAAAJb2ktMDEuc3ZnAAAACW9pLTAyLnN2Z/////8AAAACAAAAOAAAAAAAABAAAAQAAAABEAQAAAAAAEAAFAEBAAQAEAAAAAAAREAAAAAAAEAAUAAAABUABEAAAAAAAAAAAA==";

const chunks = {
  "oi-01.svg": new URL("./oi-01.svg", import.meta.url).href,
  "oi-02.svg": new URL("./oi-02.svg", import.meta.url).href
};

register('oi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
