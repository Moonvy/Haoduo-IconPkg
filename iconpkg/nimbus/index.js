
import { register } from '../core.js';

const lookup = "AAAA0IkYjBgcGjVMnjhOmIU1MxZXFbcipVMlcmRYII8CswQZiwcKAQUJA7gDCATqAoAhAwEFyBkFXAQENwk2AliMHgfXpp4syXrTemhd/fcPOdltgmi9tfC6pf5zfnbjc0ZsmSFGdRsWHtjFgYo7IHCUEMa+188UFcdQbMgtvr/z3ztnjDDr2kCzgKy6n2Xvr+Yxi1POAWyB7MSseZWVxQc0BuKVa2B9zwZxTIfSsCAe/qeftp+DaKlEjHHSJMoHgbcKROIdyCroo4dSNOREACKAAAAAAAABAAAADW5pbWJ1cy0wMS5zdmf/////AAAAAQAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "nimbus-01.svg": new URL("./nimbus-01.svg", import.meta.url).href
};

register('nimbus', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
