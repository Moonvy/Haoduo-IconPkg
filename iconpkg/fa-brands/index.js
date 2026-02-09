
import { register } from '../core.js';

const lookup = "AAACeYkZAcwYXBod4izHWC4yRTNTUUWGQ1dGVok0ZmNEdmZjNzVVmHZURzViNzmGdGQlY3YnN2UHVXMjahNoWF4HAQQHAQEDChsVGw0JtQEEOQMEBq4FXwEHBiRvCAIiWjYZAQGkAgwPGAIMkQGCBgKKARUgBRAEAwW+AwPvEQIK0QERNgUQCgMEHxoj5gKBAQJWRg8IOwOOB1wD/gRFAlkBzH46mJhB5DFGZKRaUBIwq8xAKlYA5nejiLHPgT7aiPcokfbJZa9hAedzXcKbrjaOtnfoynjrPWr2WslvyiK17fJ24zmhb4mUHcOj9ii5I2XO0RC6RGGThIM/8kCky21gHrVOFddYTQERrldCz5RJievNoh88o+U6Z1+Ow8I9f6ICF+geA2rOxmW2QuJ+Ve/um6Fm9MWPdawSeiEq5q1/sGcfRqE0cIfWrbtIhvNcGzxRzkj5liIbo29cpHLQoTy5wxMT6Uf5OkiIrBDu013LrQxTr7KCbC79nBWY0EISyINc3wtfQK3QGQXYiR9yBuKPsnQheatgpY73drsQJvQ8b6l1Xp/YwVMjaZsSJ8fNsFtE5jCy34/nt7wiQSHcRZEy7ZcVCCrRbPyR4u0Q15Rzp1KXV5dbwlE8jIxm3eP7CfHBpA8EbbPe63yn8MtB7g5xm4g824EqULL2nIhHMavpYGm3Uby3/XnCEe2ZXLapwg7+elHYtYBxRoNDL3gYptR7i7KD7CoS/a60jZKAC1GQbTaslEvyG22dSL6xJb3GUZZPtp/Kh0XDQNDyBCr4JHY4zlc07oZTuNHntR8P2Nk5QTGdZVitxkG7nbKJ69BMQEEAEAAAAQAAiiECAAAAAAMAAAAQZmEtYnJhbmRzLTAxLnN2ZwAAABBmYS1icmFuZHMtMDIuc3ZnAAAAEGZhLWJyYW5kcy0wMy5zdmf/////AAAAAgAAAHMFECpVZlFREBaSaFBFUVYQQBgVAFWlVEEBlBIFFJhBUBRUBBAEFlSVIoBEYVYASUUhAlElQEUSAEJlQIVRERZRFgBFhRlGFhgRCQEEBZUVVQVQQBhAQIUUECVIkEQhFRQQUpkIRklFQBikAkBRABABlkBRAAAAAA==";

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
