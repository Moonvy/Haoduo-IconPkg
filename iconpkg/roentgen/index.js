
import { register } from '../core.js';

const lookup = "AAAC0YkZAgoYaRrXnQp2WDVXJjRFNDJXRDVGUTlERIZpcoIraEg0OEJFNzVVBja2eHdUk0liRYV2Q5VjJ2EnRJIkE2lYBFhv6gMQGgMGDAcOAgfaCyEIBAYBIQYDMQkCASITIpwD9ggL4AQDrAGCAwHdBHAoCgcDDAQIJARRMgYTNy4wb807vwKABDwlIYgBFM0DDQElDBQJmwdGuAEBDRnnBAEBsgS7AVwNAQHHAgiDE6UBJGMCAlkCCsOxY+VI7GgbDEr8R3BY/6+iThMTfUPqZ89pQkvgCLKIdcEVl3ujKQ+jBUal+ijbqaOqh6+CvgVUx/4obMWRu1I8COzMg3jPjO6KiB2dB0HzpDzythmpMse1MjfnEvU4KTUvTQzEf+JnLzP4/5hlN/K2/7wjrmE+oKNrJplHetc6F8kt2ScG2d2Qjugf4sYihbAzrBjVLOomPcOu3dFn9EVkWxXzRL8nib8zvtcZn7E5Uph1YNrRxsuIOyZqCsLayXaGabgVe1JyR2x97L4kU1jCM/xfIAF3EaVQzG6jheqYg03wRR6RgveU4miLxuRHDdm/mzZvvOoTH6bxJo1dXW90z2IUuADZTNG24g+l7rPEh+zD/Fufqn54n7zvmQpfZueTW/wadqS66+VWJpr9pMmr1EAhP5K5U0mf4x2YTJN2KLUHZVRPMgOL5Y9zHH3iAObLDpkUPX+Ua89/1/cOewdwwWzt5kiMFzeordLte7uOENjSeuBL1wa06CvjhqlC5ukWszypOWsd7pbD41F//HeMb2cLfASNsOwdKQiUYR67Pnjm4tS4cORYSY8v2wGl76XaQB9wW/Z/QstC58h5FawcHsa/EeaTgQJEtArI1DqV+yFpYTu6LThoj/ngJcf6aG08JhFuWh/2XdgELvWcOfjvDn5Zn3LrbAnyJPoqUOryULdT9pimhmmV2E4wABAAAUAIChAAgAkOAAAAAAADAAAAD3JvZW50Z2VuLTAxLnN2ZwAAAA9yb2VudGdlbi0wMi5zdmcAAAAPcm9lbnRnZW4tMDMuc3Zn/////wAAAAIAAACDCVQoRGgVWRaIBGEWAJlQaFJgYgEoZAWBGQRSoAKiGkZlEJGAqARKgAaBRQGWZggVCCgGRUYWVGUlIAaFRURhVhhaEQJUYVpSYUpZVVBWREVUAhYAEQQFZUWAFgRCakVSJAAkloSSiBJJlBVJoQaFWRgAFlGFSWAaiZUQoGAUJQKgAQkAAAAA";

const chunks = {
  "roentgen-01.svg": new URL("./roentgen-01.svg", import.meta.url).href,
  "roentgen-02.svg": new URL("./roentgen-02.svg", import.meta.url).href,
  "roentgen-03.svg": new URL("./roentgen-03.svg", import.meta.url).href
};

register('roentgen', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
