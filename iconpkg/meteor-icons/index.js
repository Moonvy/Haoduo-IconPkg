
import { register } from '../core.js';

const lookup = "AAABwYkZAUEYQRryLtx7WCE0lDNlRnNGU4VERHixdkdDaCdlNTR0NTR1NGShiSRFRARYQQIC3AQCZCsTRgsBAiEIUwQDBQUczQSADwKrAWAOAqIIa2oCCy45BBIEKhYWAicH7wIPCQXgAZs4AakBDgNCCx0KAlkBQeyYEqlpWbnnI5IcjJWEQ/L6HXHUwgftUHvmhkiUg10k1mG7WG2Cc76fHYCnRxViw5ah01mJrdUnlrDtGJIKICZBF0s5oL/wLDWbYDx1Tp/MaR177QN3X7dnuH7l5/YlIId7wmwuElNR9GFWm7aCAUdZvyXewna+Y2x/HvMb2wJIp6VHTq+mox7n3SW7vmwizsAM+TA+rxUZEXqB/rsDKuYcOo5sHzKHq89EbxUYm6K/rN0jIGUvivCar/7XXQHOyFUcuHEJhbkUadK+ve5SqqNaXRn2yjRy5jRhlWJO4pCburVUOmDLDMGjPfOJqzY2UHgkc05pPKlDJrmPMu0q8HpprELDEW2pa9FASXkxmcuc8HicG6zeOlEiHBNbMFg/gwF8vSyEKj+VWGUqZ1UU8V3yUnEsHSbsaFaY8dwp07YkZUkRBQCBAIBAgAAAAAAAAgAAABNtZXRlb3ItaWNvbnMtMDEuc3ZnAAAAE21ldGVvci1pY29ucy0wMi5zdmf/////AAAAAgAAAFEVUAAEQRVAUEAAAQAEBQQAAABEBFEEVUQRRAFQEAEAUQVEEAQBBAFBRUUEVAEAEFBAAAFRQERQFBQAARVBUEQVRFBFAERBAABBEEBERQUQAQAAAAAA";

const chunks = {
  "meteor-icons-01.svg": new URL("./meteor-icons-01.svg", import.meta.url).href,
  "meteor-icons-02.svg": new URL("./meteor-icons-02.svg", import.meta.url).href
};

register('meteor-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
