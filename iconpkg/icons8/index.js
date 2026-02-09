
import { register } from '../core.js';

const lookup = "AAABUIkY6hgvGkjMiy1YGGVSVTZyNRNlOSs1MnS1d1U3Y2tYcyNFA1g1DDUBJEQVKAUCkQECDJEBXpQOBuIKAg4ECBS4Agq4DCcmPwykBAUDMYkzEYoBDAODAQIEAwYCWOqoUAMwxCzTyff9gHe9O6a4t+/kpmtWpR6SpLCa5uQLMCgAjgjsqnM2YUe9bEsVXQ9d08njHIIGSVSyJMQkg1s4sgisrDTPh/4trbj7111NtQdE1DL+X1OT/KI+RPU+8PdzfxE454F10I0Z5v9NaRW3O5JDZb4SUkcOz/vSyZIAkGzDeAc0JQMPoEdrvsd3F2nobDLR+23me5BdsDW8u0fLEoMVgsy0+R2HvsCf2pUA6q3OpnGoZ+G0gEN2OXMSX8Tyv98KIRwK+C8mPkZtolft0tnzt4td5y3GtP/+f74bjdf1KVn02qHzG4NGADAgAAAIAAAAAAIAAAANaWNvbnM4LTAxLnN2ZwAAAA1pY29uczgtMDIuc3Zn/////wAAAAIAAAA7AQEAABEQAAAEAAEBAEABAAUAAAAEBAAAQQAAAAQQAAAAEQAAEQAAAARAQAQEBQABABAAABBABAAAAAAAAAAA";

const chunks = {
  "icons8-01.svg": new URL("./icons8-01.svg", import.meta.url).href,
  "icons8-02.svg": new URL("./icons8-02.svg", import.meta.url).href
};

register('icons8', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
