
import { register } from '../core.js';

const lookup = "AAACrokZAfQYZBpoweiaWDJGlVRXRWFlZkYyRFSDZYdDSHNVLEdEhFcjNzVTNiNCg1aSZWhWh3ZmdkF1dCIVRkNoY1hmJAQpJh4CHiEDLUEfLUs0AgkBBAYDBwa6CwcuCEQCBfACCQSFASYB9WqUAwQTAhOsChEDBVYCIQUEJVYBAwTJBAYkoAI2MpIBcikuOqoBIYsBTEDeAQoIFMQCQCQBYIMCAgQlR4gBAlkB9FclnF5fX10wuUYI2YgGLeFdS+8hJ5gEXAouOBto1WgHvnfFlRhpFC/dz37673YGj4t4WeYXk/B+nvAom6bsPVrncjmI0WmxXcUQFX/21Tf3XCSkYDPF2cduOgoeu0PDC7PoSvieTUupidlyEqvh0mNQKljenFCR4p5hBQDeLJfo7hBUPv0A+fcA0Jm9N8aDEQqoD6Sty4JhSZVXbu2f+h884CpEYNg6JZ1HnEhOFOa7k8M1Ge9zmGmZ0YYoDA8v+t9IZmtHG57tUNrzjcLoJhgDyyxl8H+5dzbrMbmfNn86Yfc3WlWtmHE5EbxR3JxJ4+RY16B8KlKMW/5LgOWE5qCK/GTqsR3ASelMxvZwhjR/KakyA976oJ5YMABwXw2Uln/Kh2wGyd9n4qjerfj2usBOCm9paNQcdkDVd1ZQp2cCFW4b70nkNXg/jjm6jafJ+4b0q26T3c17SDfgKrSXkqmITRN/cqk3jL3E2teDTQQfOVK3+0yxBbozaksgkfJNNviLDZCc93N0Lx/H88aps0vY8G8jkPaptfuZ4TNsv3DFK0bUWwlBRrZo+HOSjU2cRcIRty1rG70fZjLQSzkZywdwkY6RV63Lm/5SkO8jASQaTUT+Cri1Psb9W2WaAyShWphvn0EcH4AZ5iTiYJNBpVH4CjrfTQAFAACAQAAOBAAESgQAAAAAAwAAAB1zdHJlYW1saW5lLWN5YmVyLWNvbG9yLTAxLnN2ZwAAAB1zdHJlYW1saW5lLWN5YmVyLWNvbG9yLTAyLnN2ZwAAAB1zdHJlYW1saW5lLWN5YmVyLWNvbG9yLTAzLnN2Z/////8AAAACAAAAfUBAJgKSCgQCAgAUQWUWlAEREJSRUSVpEASBUIQJRUJFVFRVGRRQCAQUqgSRJQAhakClQEQoQqEZQqSJFFiWWVRlAQEBlBkoRBlEGEBBVVZRoKpFUkYgZGFBYkARkEUUlRZFQBWBVVIpmVBoAZmQUSCWkFUQRUECoQiKRomRAAAAAA==";

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
