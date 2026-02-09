
import { register } from '../core.js';

const lookup = "AAACsYkZAfQYZBqJeHNAWDJ2I3JzN3iDd0OlV6RUZ1NUNzWGFXAmIzxVg2VUNkRjd3dyajRCUkNINlJUdTEWVmR5clhpUCQDAQkCgAGKAQXKApoCBt8C6QK4AwMHAp8SRRIM0goNNY4CCAJRGhoMAgsPea8DPOkEJQMGIQIKAqgPHIYCD0sQAQICAnIjCRN1Na8oCwIBAQEQAwcsAiEDFwE3CV4Hck0DTpIEYQI7AlkB9Jf7n7q9fl071fqMnKdHGX/ARlpOkyDe4T9bYFLh2ZN/mhTof2Q5qeMKtEun70Q6SZ6g1VHEyyvNObQYavg4YyvGkRsk2cuTCeWDB2duCihp+5m5TSneS/B4WZRGYTeM8Gk22PiknuWz/VgzkBGNvm5INQXFClzU4LqZUPbcgN7UESQTrVZf4HL3OuXvbFKhjcpwA6QK0UfwnpmlnBX72W/4I5jX+nBraZBiAgreTT7if3Bc9vs3xzoNaYLqM34z/nihaREmGd+tnCUfOXhoSILFyypbV/C230kxanISH2GgQZwuayqPStp0PZ2gvYdQ14B/k2AfiTrCUZDffOaLEOlJ+rgfpp+yJiFS7XdLxfo3v/eIYWdUNty3qZGIzWj5qLXGBjJNX/S7KnP4LVDv79E2kVfAg2Ds/gCeZ00875IfFJqY7ihBTSzGOiqY4IscFeRPXUFobiXhdvdYL+jzF7kIJCw55V7iqR6f/EVOG9q8IwVb3ascxySKZpfyX4SSnOiO7cNa4g+I+LGWcrFz1NQZiJXnN/hGLckDb0N38wDQjQpEGPbFAW/DeMlsmzDYNacbkTC7buSzALRfHTKGD9Y2wgY+qV2pZjnLzwDGnC93WrXmoUsbt1AQ/ktlS5WKj3EDf0iOcBqGL0yGPv2YQFDEJ4ZJTQgAAACAIQEAhAAESQAAAAAAAwAAABdzdHJlYW1saW5lLWN5YmVyLTAxLnN2ZwAAABdzdHJlYW1saW5lLWN5YmVyLTAyLnN2ZwAAABdzdHJlYW1saW5lLWN5YmVyLTAzLnN2Z/////8AAAACAAAAfVgBWAREUVFZkhaZZYQQBGBCGERZQhSJJFVJEiQIlhVEAlGFgCJQBgVJFRFRQYJRFIICAEZolBppFAFBRUQChlUQAQaBVhWVWkUQoRFGiREkAJCVFYgkCaFSRRUBIEhBVGUhlAFKGQFVQYRZqmgiARAGWJRgklQFSAaZIGgIAAAAAA==";

const chunks = {
  "streamline-cyber-01.svg": new URL("./streamline-cyber-01.svg", import.meta.url).href,
  "streamline-cyber-02.svg": new URL("./streamline-cyber-02.svg", import.meta.url).href,
  "streamline-cyber-03.svg": new URL("./streamline-cyber-03.svg", import.meta.url).href
};

register('streamline-cyber', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
