
import { register } from '../core.js';

const lookup = "AAAAVIkYMwsat6K3Y0ZDczQmZwZJAgE3BjsCBCpjAlgz15X5g8pTJMIKpr5pAXQ/oDr4RFh6OuzekiPztGE43qthvN+Asm1LJpYJ/YKu+b0bKkC0QiIAAAAAAAEAAAALZ2FsYS0wMS5zdmf/////AAAAAQAAAAcAAAAAAAAAAAAAAA==";

const chunks = {
  "gala-01.svg": new URL("./gala-01.svg", import.meta.url).href
};

register('gala', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
