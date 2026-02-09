
import { register } from '../core.js';

const lookup = "AAACookZAesYYxpNGRTOWDJihDVVRMRmdUVmRxg0J3NjdFFHZlZkQmV0JENDRkYXMzVnU0mYd1V0Mzh1hlUzdHU1AlhjA4ABGyM+ARYdAQsGpls3wwEkCxAIBRgeCvECBUkDCxgY+QIGIwxDeQIBAS0PFDYYBQcFAxICDA4CBkADJgeTAQMW9gYImwO7CFOAAgI1C6IEAwLmAiKEASIPDwEEBiIiWxYOAlkB6xJd0KD98mC2C4CMffC5fWHI4V1ADUiJmAtRMDYOmgBOMK6UVA7x83aZy8Ok0Mqwto8g5aULXeTWGxyhGRbNB5ZLXSEe93XL3rvPThWXrTUt3SaCsCXmQLjZe6fKirCYamlYnJUQFrGsNNoyRplG34uas4kV/tVpHHkYBmCi5Jp49WG/RHHA9iybEgkbyyMbqgWQllg7+Dv8LecpJx4waVazFCGUlFKV2teveCB7PkZriQRQdfQHUAr+RfZfHT2fp1qQNP5ceA/C8Jwgdq/wzyby2lp9JY7sIdXLszXmjOThK1awgdbsugHtj4cFbPLaA3Ra82HAG+1gf47FrSGL6nNcWs7HVmXKos6n97pg14M/vpxH+oeaTfW+7Jnnb7Wj/bISxaROtpi7OlDXjcpNMYXkHUprMhRdLSow3I+M8hZAVTidqV1lX32TQedeEunqrHXhD7tCCi7vtCxHHi1nHYWp+YNsx5Rpp4dCySJ+Rh2DWPewZwubeJIdo0kBj3GGqJytnSNByG24QusOHGWXcMbCPaTj8uXxZ49g863MCYJcO14CXRw7LKYyXSf0QFLmdOmJk0aWWe9cER4+rXLoOjbCUUVhUv6+90FhV+6SNKdXrdDZo684UDapmVMtwfj66ubYyaIDOnYPb2GpTQAAgEoEEACoAgBIAAQAAAAAAwAAABNpY29tb29uLWZyZWUtMDEuc3ZnAAAAE2ljb21vb24tZnJlZS0wMi5zdmcAAAATaWNvbW9vbi1mcmVlLTAzLnN2Z/////8AAAACAAAAewUpIFFGhQQoVZQgFJEWIURBQgARECYFFBVIVkQUAFgBUkgZERBBCRUCZGpQhZAUZViJJlAREFGRUAVBCRJBgEVmZEFUWAhoRRSJkgWGJCCRmAWBBJURlllmAVWVgYCapSVERQAKoIkQElhSmWFRBVQEAFUkQAIFZBEhJgAAAAA=";

const chunks = {
  "icomoon-free-01.svg": new URL("./icomoon-free-01.svg", import.meta.url).href,
  "icomoon-free-02.svg": new URL("./icomoon-free-02.svg", import.meta.url).href,
  "icomoon-free-03.svg": new URL("./icomoon-free-03.svg", import.meta.url).href
};

register('icomoon-free', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
