
import { register } from '../core.js';

const lookup = "AAABlIkZASAYOhogGoaDWB1XVHM1JkQ1RGVXS4QihXNFYjRDeGaIVoUzljQ0Q1g6HxgpC/IFAgk2AxELCgooHWLpBSOzCgkjwQR88QMCYgYCFAUCGKcBdgEOjAGnARBEAgJLlwIHAg4IGwJZASAUnPpUO+15EXgdggEdv4ZRA9oGQ+bT8qJmgqxTmIMy7a4HzxIzTr5zF878anV6YKjjlqBTALegyRh/sC+U00rTSS6wfGW/s4fwWNOrR1kXU1UWJcxUQWoKQMve2XuvKOLRYs+DwD+Q4lW7GTDyy7staHt+h/fe7/QUEAy/0Tr/opUqHY5pk+23G8qlqcGtHqmGqB5b143XwmNCke+ulomUnx6mptjtlJyfj1fG4Z7CzJ8zSdYVvo/MhdQbLL7oPwBbUizfLBcHrRuwlEg50UKCWyHMBTBmkA6Rs8wYdOVwup29u3OeddnAI1vzRZWAvnHyTc5tREkTNOMdz0kXyZLHanCdJw7m1j7WVDtmV+BznEgU0Z96eURZ4zrm4jbX2GlIECAAAxFBgAAAAAAAAgAAAA1jaXJjdW0tMDEuc3ZnAAAADWNpcmN1bS0wMi5zdmf/////AAAAAgAAAEgUURRAAAEFEAABVUARBAQBEEQQAEABBAAEQAABQFBAAAAQVEBAQRABFEAAAUREAABUUAEAAQARAQQEVAQRUQAEFAAEEEFEBQQAAAAA";

const chunks = {
  "circum-01.svg": new URL("./circum-01.svg", import.meta.url).href,
  "circum-02.svg": new URL("./circum-02.svg", import.meta.url).href
};

register('circum', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
