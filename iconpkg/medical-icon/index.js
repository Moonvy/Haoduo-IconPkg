
import { register } from '../core.js';

const lookup = "AAAA1IkYkBgdGjl1AwNPRpQ0SChGdHQ1ZFZkYyQGWB9RBw7xBgKDBAG3A0MFA/gC/QEyBAI3FwVYAhgDBaEBAliQn3uf0HFq+SKQb0d9ULFo+tIPBggy2iIE6uGDwJUQhkZTLRJhMy6XsfBd15ezho8hRS07OQbVyuQ9JvKmDrdlWUhXXCxi2L/B+438Xy6M5NOv/qFrY2NUJyBueTeKtSjUBs5lxkawFwKKRf1ba9IGCzjihq5ju5Hf4SHgfv+MpUP7yx9k9XFemSByOuVJbsswRBBCCAAAAAAAAQAAABNtZWRpY2FsLWljb24tMDEuc3Zn/////wAAAAEAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "medical-icon-01.svg": new URL("./medical-icon-01.svg", import.meta.url).href
};

register('medical-icon', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
