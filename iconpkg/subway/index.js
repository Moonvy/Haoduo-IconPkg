
import { register } from '../core.js';

const lookup = "AAABqYkZATIYPhrWF/P5WB9ngVNjNoZiSEUyRmQBRKo0V1uEQ1wkZVdlJpI0FCdzWDsJIo0JGgMaXQMdfh0EKAEBAwcEFT8DAYIb4RAXKU3zVQIBRgLM0wJHigE2OCUDNgLAAQ0BCpQBAgOBAQJZATIPcWlp9Ks3i9q3rpaBN53tecV7qgfQWxtN89+YLT1GHmBDHbOUjy2M/NE3QAdzDCusAO+lcbcbNVsEsDkN35mXpkebvmtogioaeV3Uia9Q2iXN9Ii4u9n+d1l0keWce5XjopWh2+Gw2u5dgZik/jqNvxptg3vdO7xH1sNECvUB4VydMRH2wGRUC5s47s+XIzxl3ZSKXzPT+wJpgyiROMO63eUOHgtwFO5XQD2/bKQDNIzXocNn8T2Xsdo2/dw5/1DnOp9DaQL/+w7ZLSCmE18trO3H+71EoN3VFZ+HO+1+fmwJA+AXhWS+MPRBbI6vBcTBDShkRBfFqFYk9+zp6ir5oqxclILHb2nvChPrKbiKWyy1NEq/w8/FPyYsMqKQiaB6Flc0MEUyInyLEWNEDCSByplIFJAAg0AcCAIAAAAAAgAAAA1zdWJ3YXktMDEuc3ZnAAAADXN1YndheS0wMi5zdmf/////AAAAAgAAAE1AQUVAABEQREEQVAEVEAEVAQRFEQEBQEAABAQBABAABVAQQUAUUBEBVEQEERBQEEERUBBAQAEVEAAABAABUUABAAUEABQEEBBRREQBAAAAAAA=";

const chunks = {
  "subway-01.svg": new URL("./subway-01.svg", import.meta.url).href,
  "subway-02.svg": new URL("./subway-02.svg", import.meta.url).href
};

register('subway', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
