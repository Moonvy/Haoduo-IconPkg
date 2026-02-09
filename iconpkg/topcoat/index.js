
import { register } from '../core.js';

const lookup = "AAAAiIkYWRIa0c0wu0l5MxVlJqVSZFVTsRObAQECCE8ODg2bIAMKAwEtLQJYWZCGNZhsFhveghUTQa34fqFOM1GFHq9gG9e+sM0s2hiH7706QbUCob587vCYpqxCRp35Xfg/8smVq9Ft6M8AIb9s7phpX2BreikDg/9HJFILMG3OWlFCIyFQQyACAAAAAAABAAAADnRvcGNvYXQtMDEuc3Zn/////wAAAAEAAAAMAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "topcoat-01.svg": new URL("./topcoat-01.svg", import.meta.url).href
};

register('topcoat', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
