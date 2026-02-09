
import { register } from '../core.js';

const lookup = "AAAA1IkYkBgdGn5I2h9PRUNGKpNyJUhCcmQ4SGQIWB8kJwcDDAu4FAYMAbkBNgGUAQQCcxVPsAIGNgIDIssEAliQY7APswbffluZcgJc8hKNsY+fR9JuIbf6pWQGXzhUPa/T/Wq71IbLjEmKRS0tSCfl0oyGH2jhLiDBcfziIjn+g7Fl1w5Tb2PY4TcokDCRMnmXRiYzzuBjF31iCxB76sBeayJDxuRZBIZdIZUGn+TVl/u1a/n1+/8IOtrQpmWuRS6/bsthIIo78AZXRizKcaFQRIAAAwAAAAAAAQAAABNtZWRpY2FsLWljb24tMDEuc3Zn/////wAAAAEAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "medical-icon-01.svg": new URL("./medical-icon-01.svg", import.meta.url).href
};

register('medical-icon', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
