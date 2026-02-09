
import { register } from '../core.js';

const lookup = "AAAC6okZAh8YbRqJ7xGXWDdzSUEiRCdEZnaUJwU2NTFIhEMpRklSREMHxFRXSlQ3QjejdVmGQ0WUWGZWg0JnJWk3ViI0hnIIWHFU3AkDBQv4AQEFEF8gAZYBA4cBbgRjBAYEoQMFCHMHiQIBCAFaAQ8DAwEBgwEKxD0VNt0CAskRJyg0BQELXAEC6RMYKQ4RmwHCBQQPCgQZuAHqATtRngGWATwDYQJ7DDIBhgqyAVkDXBYBCTIvBGCrAQJZAh9kzxCyHH8DTeyEtOFMqpXnGclFC/pVU2ODRMNtgNhP7eirzdWBHa9Dn4XXGoB6oJdbU2t53tdNaaVssxPsYCKtBy2RLtnQd0XFyEU9Lp/xTQ6x6rrzXA0KO+LqOLEMWoAd64QmG+bDjFW+ATgfNISrMbNNn1deEMzaicAeLffMhfuMVkC2ttucqTf+RYHXUyALzHk+0i9ziMG6AzoL+dvWGTs12GDnS0xQa40SiHe3MXci3fNBdejrkye0D/m+EBQZCDkvBy3Rs/Xs5giWG8Bt0XdGlCv5mK/UQSzrRyZKNoGG9pn5hk03h8KQfOYSDnRLwT3p/gjH4jVATs7v8mcdXArjjr4wIY/oyQRbjuOBJevQXI92BIOaqaJD4nAbi18dxngctW2krfDJcFqEcrkFMg8PXFYyzvBUYguwog+/jRChS7+Fl35/l6+z+xHuAsmLCEgyQRnwySkHqN04sO5lAS6OE1LWHb3u9iCZ4sIhrM0i1EscgWHmNTiGv09kg+4IPnd5Hn5GOzDt/HsCVsx+FDDm+R6dnVJnPM+Ku/jFb9kX3ahU64vsIfn2hj4dsm9DOjTUthtqe7FoofxunA0/da9+79cMMnf4ESilBAXRfaOgMBgbNMNLK9Yet1r5vNgSbLlkgaqa4LmAbNH18uRHvLc9kyX/JULjOMLsqprgDQRRxp5USM1CqWsSExzzKQsETM2wmSVTdcE2ZKYYUoZO2QCgGAQCAgQAAAABoAAAAAAAAwAAAA10ZW1ha2ktMDEuc3ZnAAAADXRlbWFraS0wMi5zdmcAAAANdGVtYWtpLTAzLnN2Z/////8AAAACAAAAiIkEFoAJFhZZZpgUoCKYgkIaQiSBSGAmaFBkCRmgUmRGZUhQVEUZCJGEImRECJCWQCFCkASlVKgGRAJUAVGBoIgRhpVZmaoSlpqkRkIKECREGiEpYohGaFIBhoBVEGVQRFhlAhCYEYmESaURZRhARAkYCFKBBSgBaERphaEkVmFRVlVEaFYUZQUAAAAA";

const chunks = {
  "temaki-01.svg": new URL("./temaki-01.svg", import.meta.url).href,
  "temaki-02.svg": new URL("./temaki-02.svg", import.meta.url).href,
  "temaki-03.svg": new URL("./temaki-03.svg", import.meta.url).href
};

register('temaki', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
