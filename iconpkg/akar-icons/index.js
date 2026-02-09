
import { register } from '../core.js';

const lookup = "AAACe4kZAcoYXBqoSDO9WC5Uk5VFZBNUQjdVZYYjWXJYRyMVVrVnFVI1WDWodVSWRlRWVjNiJTdYcBWEd1cyWGIEJAQgEPEZDwcCBANEETQDRQU0ByCHBgjWCiOjAwoHIgcCBDa2Aise3DKAARsMAQ4EC5MDFAQClQKJCQu/AgkMKOsCBAgICggEMx0IAQEVApECAsMEB/sBGw6ZAuwBcnVXCAJZAcrYCWLAWL2UX5W/kMDrviJlvEhg70TidLYZrw6nyqwx76sHYh56w8jIPtgVgcHMdzDFjBz43x6gtowhRXXSaTaKxWWMYRc3fmN9PVnuwF26HmHJSCwxJpqn7F7kOwNfUzT5lPSKfeYFXfNQFyDkrEJrKtFctXDzBW6UB7mp9SVpuTKuGOKVmIB1+DX5C8LZIYecgtOq1oQfGugdNhERsVKplh3J1p5OP1Swl7I7JlsXm5Swoel8cFVHkC8adp192WKtkpVxNi8hQg2pRkFm05w9dffTaZlBactgKXc3g4ES43n8RO4YbY1V8+2H42/+HhSeOseT3P/5bhshbKgk5jRzxwfZJifo0afnJAc5QJQYhRCRgcvzX5tw1id9AyJGAmE+bB4wJzMJcudewDAXPH6FGUQRLIh1TLEffn+5Op2wpnPms8MIWDzF4+a9sbu/5agzrW1/Ixy7AizPO9Iy8T++qshUrrZE9PIorRfLxYa+pdZtOvmEjDbUXffX5c2guXkd7nyVEoRuvwfQTw1JXPRpd2t3NhqVnon2FZGVACJxnFW0bFSsuZxgXqcRa2y+xj7Lee1sMCqzQDFQdvkFdb/3eJRJuZIUMG/CD0wASQASICAAAAAICQQAAAAAAwAAABFha2FyLWljb25zLTAxLnN2ZwAAABFha2FyLWljb25zLTAyLnN2ZwAAABFha2FyLWljb25zLTAzLnN2Z/////8AAAACAAAAc0JBUVFEVYoAFREEREIBFVQAEFUQFCFmACSEQSZZEpQFBUIAQQEEAZUKZVQFgUBEUhkVFVFGCQoEUQERBRGVlQQhRRFUZEAhImUQBahAFBBFVWSGWlBRUBRJGQQAIRVmlRFEBREFQAUVQhZkQAYVgFhGiAAAAAAA";

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
