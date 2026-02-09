
import { register } from '../core.js';

const lookup = "AAACsYkZAfQYZBpSzMZjWDIWMkQic0lHNXN0NWZ3aWZDRKFDWVlTMlF2N2JFZVVEhkREZGShclVGSFhZJ1YTRWlltFhpCAEGBg0BC84BVA4xDhABAhULPHICR1gFoAKgBBFMQQIDGQmpFgMIwQg/+BkMBBECAmKFARICngEVBgW/AQwbCAITaRwFDwT3AgYOtgEBEAwVBCgL5AImjgIWGQFBHQcKC6MeFwZBCuRnAlkB9BwC9lJh7j6f37lzW8ubyxoN4dlmRxTJVS/NXysqhAAYbkiop5L5YXJdRz3hXTeVCcapUMd/TWVGWJ+K+1dBaDFo4qma7JPdbmeR93+cewpLUN9ERuITfN6Y1YdvaH/oV/3Ef/PeKZw55aEZgLr6klCVpPuPcnbFMySTkD4RnElfTova+u8DJYixrVmDqTXYfvPwQXEN/cu1qyNNsbsZtenoYwsbUndaBe/Fwy45l96gOvhwbDmmH8KLd/DvoEkbkeAep63tvjpngLbmutl/XkzZathKyfqNWrvXWObGD5AEA/acUPf2Wv7jJ5m3w2kVJF/0ZQXnTWb4AImMEpzLkU04SFx+BtxwRAZux6vAWyYKYI0dCDD7mL0KUgAsH/YPcEnSKHK/f0uCmeqXb6lrnhFLF7QtBDeOKJlzNgofWwMkaUtGIaA64Gn8FLMRaZuRV/457RsfvZjUa47UYFRwbza4XPeeM07arS34nAHGGRCTCjDweBU0L6h40Lf6qUFMJDOeOU3wUYhokzfv6LEb5J4y0IxIc+td+DbXQJ7RB8UAQwzddMVsNfI6jQc8P2DKpd/k5klFloMq5mS8rYbVIDdLL9Eyxp2YHCriWOHC97q9hiMG/oa5TYi5H8Cfz25RLLOQKtWkd/iUdt4lVks3Cu8QGKlhTUIAAAAEUBAACBEACAAAAAAAAwAAAB1zdHJlYW1saW5lLWN5YmVyLWNvbG9yLTAxLnN2ZwAAAB1zdHJlYW1saW5lLWN5YmVyLWNvbG9yLTAyLnN2ZwAAAB1zdHJlYW1saW5lLWN5YmVyLWNvbG9yLTAzLnN2Z/////8AAAACAAAAfVVAKhpFEUglICVGJBZFUqgQRAUAkWAQFQIRaCBgBUQShSFhaYlBQEJJEVVAQEWFgQZqVBYUFYRZUmFYUQSBUQgQEAAEiWqQlIJaBSIYWBBakBWBGYBCVamRRRJQVUAWEFEpVGEkQCZASGAGKRCUCQZJoQVYiEJSZRUlRCVVAAAAAA==";

const chunks = {
  "streamline-cyber-color-01.svg": new URL("./streamline-cyber-color-01.svg", import.meta.url).href,
  "streamline-cyber-color-02.svg": new URL("./streamline-cyber-color-02.svg", import.meta.url).href,
  "streamline-cyber-color-03.svg": new URL("./streamline-cyber-color-03.svg", import.meta.url).href
};

register('streamline-cyber-color', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
