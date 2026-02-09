
import { register } from '../core.js';

const lookup = "AAACr4kZAfQYZBrbjvwbWDIzRHqCqERjRCRFh1UjNSYxiHhFNnNFNIZXh2VFYXZXc1g2Q3OVc2JEY0SVNSNJVBNHZ1hnCwQHC4wQYwJ0/RCFKQcbBQEDBgJULxsFAxsPcwJBCMkDnwIlAWwFBBciFw0B1QH5AR4hLuQBFAtNGDcHQB4JAQItGFgKIATKAh/+DAQJAUAtAwMXBxMn2gUGCAMBqAMGEPAEGaUCEAJZAfRXUioFTaEa1VLwcFDZT+9/++hOj01L2JypWkzg70QVuRcARkk55oxdiKnhVxHodu+0+Rg2scUfnvvHIHIbCkNGaalgOu8qJIsAEIMSjZ/auo0zw+Kc5KkF1Ut8N633+sZ+A5NGZxMdmpJIz12RCDvDSSyGAsYlYN/a478NGZH6TW83M5tqLYhpMGFftZNwjF6Xg4ZKvsK0k2dBndT3KdHgUj7eaOWKq6f0OiUxaWwJCiFbTqCe+H5LNZA5JH8KSzlf3PD9Wy8/NcuIkItu5/inD5gRioDl0ZHEljfuod/w+K1wPrr42fhzK0laUEnk+s3wxSuCeDnEmX+VZkuNJsazXzxQb7HFLLsUd9cj37vyG+BacBsK9xRQk6DzHy/tPpkGA3hcmn8Pj725nOHNNuLvETagdCTicpWfJslqqC7lJwE2wodgAAofR56yRTp/N0EK14Yv/jKhaG8oS/pZBk22M5eRHNA4EFin9p5pt94omJg6SJCf5ezoLfY5azr7ysuJxmfhZRilZqTUQb2Ace1yAP6pUJTH6bjmnGIZUR7YtFamaUcj3WuO3pz89sVcKneSPcmOVHPcwKRkaGEfMJxuWCphhANdbtYf1GNu+OqZy0AZ8yS8iFvehrUc1ER3MhvAsxXLeNn+f039UftfbIK3eEgHmE0AGAJiAAAAARAAAMgAAAAAAAMAAAAXc3RyZWFtbGluZS1jeWJlci0wMS5zdmcAAAAXc3RyZWFtbGluZS1jeWJlci0wMi5zdmcAAAAXc3RyZWFtbGluZS1jeWJlci0wMy5zdmf/////AAAAAgAAAH0QEGEqVRVJhBakEVZWIYKBFUlVRhEZJIREgRJKRKFgApgoBVEkRgGBVQWlAFIUEgUQklokCkEUEkQSSRFUQlIZkKEUEIVKhUhoFBFKWoVQhUQFCZGmgYRSURFigUhBFCpQAEVIElABZkVSFRBRAQhIZABkhFJQJBRVYqhUAQAAAAA=";

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
