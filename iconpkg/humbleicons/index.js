
import { register } from '../core.js';

const lookup = "AAABlYkZAR8YOhq/WbAmWB2lRDKiNDWXWiWFQ3VDZiYjY1WQpFIwmlp0J1UTVVg8NOkKBBIBApZWFAEoAoMC+AKuDQkwARnvAwsEGSsKChYnGgEECHytARr+JRgCsQX6EoIbKQJISgIQCBspAlkBHxoyHqtdgP3J7eQSLqk2AcUBPqCCyDMY8o87GOI82IuwgnVEzroWrAW2l4lHrEKkuqMzkX7Na2dQewJ31UEXmGVpc8RGiJZ17vNbwrBsgebDtT7/0Z0Pboc+IakKxv54BiJXA19F1dHrF3MVLFoWsN8FGErPbu+32wm5wVPZt6l2M4GRlfeRrExOfrQGn75bG3hzmKd8br++VfIPkvwY5lWHyDzKxTtRUT/tF/FRfYwmrYx+2mwxchD5UZU8RhgQFxskKjHRbOKD+/cGxefJuTAsO8pIS6yvU0cHKkj9vhGzZMAsEWAJrtaKxo4UwfTv3SuFOZDz/QHmMKltHDzHIq7gCqxqlZ9+ehdS7N5gHgMUOoVRadgAv1imjLLX9G2zSBAAAIAZBcAAAAAAAAIAAAASaHVtYmxlaWNvbnMtMDEuc3ZnAAAAEmh1bWJsZWljb25zLTAyLnN2Z/////8AAAACAAAASARAABEABFABEFARAEEUFAERUVQAAREVABAEFUEUEQARAEARQAQBUAQAFABEEABEAEBUQQAAEERAEQQBFAAAAAERAAUABAARAAAAAAA=";

const chunks = {
  "humbleicons-01.svg": new URL("./humbleicons-01.svg", import.meta.url).href,
  "humbleicons-02.svg": new URL("./humbleicons-02.svg", import.meta.url).href
};

register('humbleicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
