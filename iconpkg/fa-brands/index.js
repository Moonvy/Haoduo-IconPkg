
import { register } from '../core.js';

const lookup = "AAACfokZAcwYXBpRdx4vWC5VWTaVJiODQzRmVpd4NGJVVZVzNHRTZEcnZVdGJUQnmFlSEll3QpKFEmQlVXYlWGMnAx4/GgUCKLcBCwED2wUENgkuK5kBAmOXDaYCcxQBAVEeFwYUBaUMAo8CCgUdLQEBB5ICrAENBaIBkwFxGQMJAg7mAQLoAckIngxWUoUQDDkFAwrlCAozAgZzCwEwDTFFBgECWQHMc+5Vj5BB/W/t7pcuFV3CCyoLlJf5e1KhPcvtwigVb7WlG+mAogJtUYhc8auRuzroYDlciI5AmVOJdMgfKsJq9s4DzkkScNgqtxhpf/aYgaH0eM4B64+1UQ4kfskiLxXc4/7r9CPQKkVn7qTl5pgSyf0QXJteb8r3Eakn6WW1z21PnUH3f2wB8JyUOkTkiVvemIyhsfPKcyWyZuvmh3ExMkCxq6JA7oMZZTy2OtjnIiMSrPKDIZQedsLRV1wPSB9kfluWclfrCXfj8tjGHqZNn4M5EcOzwzbWYDQiG9RWbK23hlCJiJu1P9dIEsay0fJ5pEY9z+Z12sykkpxTX6SXow+yb9+Bm0VRrCqpMLL4h7KUy6G2um3YZ4uvjIhOn0IQvvlGehJBj9ltU1d8wpbnNnhY2zBg0ELDd7y50VrQE8PszpFR7ftB30gXDiZCvYMT/Kfi6LJljkS2o8fvufbQdq6JBBA+SNMGPI32o0vK17tHXQydwctRNK5hR7ZYBXJAMUY8ECGrKmkIrbtadpNx4oJqsJtDuACtkVGdo7e88jzNBGHisKfdZnk80I6sre08XxsxH3Udrx+txc3BroTGgIYhUIhBKHo4/WW050wAAgIAAIACAjQQAgAAAAAAAwAAABBmYS1icmFuZHMtMDEuc3ZnAAAAEGZhLWJyYW5kcy0wMi5zdmcAAAAQZmEtYnJhbmRzLTAzLnN2Z/////8AAAACAAAAc4VCUJZAhUAAVAVUQgEoBFhCAQBRVBFCBlgUlkFBFYSEQRVVCEgFRFBVhVkIBBVQhUFVBJFgBAGpBAFkZgpFGkUBRUVAFYFQVAlhQBaBREQKJZURZUCRFRQCURRAiBUBhUAAhVYRkRRUUVFVCmCiAUgEARQAAAAA";

const chunks = {
  "fa-brands-01.svg": new URL("./fa-brands-01.svg", import.meta.url).href,
  "fa-brands-02.svg": new URL("./fa-brands-02.svg", import.meta.url).href,
  "fa-brands-03.svg": new URL("./fa-brands-03.svg", import.meta.url).href
};

register('fa-brands', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
