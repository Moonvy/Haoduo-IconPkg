
import { register } from '../core.js';

const lookup = "AAAAgYkYVREauwokuUlklldINEZSVANQAxYVxRlQC2YSA50BBBgEFAJYVauc2W+kAMizOQeUfmxrhwxAobd+NfOwmk+cdiA0NRgmgUMBG23yPGq0lxnVoqu2BOaYsNZbs+66B9aaFFiW9zXs12sxBxS5vgEHN6Mc8dGDUlESDqZDABIBAAAAAAEAAAAQd2Vic3ltYm9sLTAxLnN2Z/////8AAAABAAAACwAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "websymbol-01.svg": new URL("./websymbol-01.svg", import.meta.url).href
};

register('websymbol', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
