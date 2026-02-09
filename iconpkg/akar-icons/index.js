
import { register } from '../core.js';

const lookup = "AAACe4kZAcoYXBo+mDuIWC5Dc0QlWCZVR2RSJpJjKWc0YlRGMjaLFDZzU1VVWVUoU3JFdYbEhTY2VzU0ZSdbWGIFBQIXBQsX3QYJUzUZPQoBqgEBIALPAwYfAb4DEAEBBBEaCCwCCwUB1I0BqwFYBwEaAhYgBU0E3wGBAgdi+QMKEAHpASEEMHkd4AIau6kBHdYHDAMcAUwpGgQRAS1kH90uCQJZAcoXEm/jlUE2IZn5+QB5JJBgpxVrbSy5YiZ1aWVZcB/K0pRUHh83fhvPlZjUCKyBPm3rnIKdxwPLULCnbCbvfQ9dbAIXM5dthIqrILS+9QcRX7txJxxEkR4ZcDr3nQ4aHa4znkFs1uazRkatYehJlnKa6fQHHtzT5qx3JrEYfFKVXthP5b0eHsDx09Lz72nF/6GpuX2oFLx42XyHaZWnoN+eESnBRFuFxRDJJXl6xSyU4tiSJ9HuuuYXPYapawmUvhgN1vk6bjVVhL1M49m+KjT4RDaVWLDRnOwwCXauye5/MT/05hSAITdhLF4v14rLNmm5MCL5tpNzImagkD/QL5whdUkjMjR9wrl1y/m2U1Vrvu3IcWmqMjGDOoy1PsjI5+XkdR2xYqp/7pskEneF/vSH48CBuTCb9nQHPSh2fsey1g1AdxFlzKg8kYwFSJ5dPLlwnDBA/FW7GcCUXkIXffLTXcsCdRxffpSnvwXWkr9FgcUD92/N4jlEpbZsC8NCYBHkR1Sm8xdhrGwF8zZI84QhlXeJTq2UB68Vwq2zOz4nsO2piLHAX3n4Nsa/9+duHVxYO4xuGmNQjVwYVGBzIjEwwxro2QcqjL87YkyACEgBEDAAIAAAAAIAAAAAAwAAABFha2FyLWljb25zLTAxLnN2ZwAAABFha2FyLWljb25zLTAyLnN2ZwAAABFha2FyLWljb25zLTAzLnN2Z/////8AAAACAAAAcyBRSQIWRUEAJRABEYUBBIEIVQUFAQFSQCAUQYkakVBFEkAUFKJgBFEIBVUQARVhAUVABERmmEBQlgSQQCVAVVVSQFYIUABWWZJVAFZSUURVkJVFIRGgFQRaIBSaUkUUSFYBARFQlVQRBBVBKQUAhQWRRQUAAAAA";

const chunks = {
  "akar-icons-01.svg": new URL("./akar-icons-01.svg", import.meta.url).href,
  "akar-icons-02.svg": new URL("./akar-icons-02.svg", import.meta.url).href,
  "akar-icons-03.svg": new URL("./akar-icons-03.svg", import.meta.url).href
};

register('akar-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
