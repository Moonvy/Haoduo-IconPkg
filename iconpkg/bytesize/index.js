
import { register } from '../core.js';

const lookup = "AAAAmIkYZhUaypu0jEtFd1JmQjJHhVg1BFQJCEMQAx0eAQEEkAELVKgFUgcDGgJYZpaglXVgJx4y3xvPFIF7LB5TOKb9EfSrrb6sMAcOaA7+11K9ulwqA7mDaU5luvR/gtdzPoeHxwu+lnNGZycwndJEn8yM8/dQG78jQ75YSs84DKxQHkQsAAxpv52nx20kuvd+vaOzlUOAJAAAAAAAAQAAAA9ieXRlc2l6ZS0wMS5zdmf/////AAAAAQAAAA0AAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "bytesize-01.svg": new URL("./bytesize-01.svg", import.meta.url).href
};

register('bytesize', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
