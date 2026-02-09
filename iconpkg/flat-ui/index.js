
import { register } from '../core.js';

const lookup = "AAAAlYkYZBQa8lt3TkpDW5ZkZGJUFUgWVAEE1RIlc9cBDyoNCAGBARCGBAEfAlhkqJDzuiW2bAIgl/IPXZIbBurmHkjUr7L0Mvlrz2/5g8tKNZKMbfmrDnUqpk4H1/+QJPS869s57Iyo0U40opP+yNdpvDZQo6xurURz4uY0OUf9ty1mDadnJfQmlsT/xb/k5ZVUR0MAjAgAAAAAAQAAAA5mbGF0LXVpLTAxLnN2Z/////8AAAABAAAADQAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "flat-ui-01.svg": new URL("./flat-ui-01.svg", import.meta.url).href
};

register('flat-ui', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
