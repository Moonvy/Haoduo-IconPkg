
import { register } from '../core.js';

const lookup = "AAABPokY3xgtGqumr3BXNkl1NWOWc5U2F2BnaGRUJkFYZFRDRARYMD0CqAQOAc8BD0+ZAY4OAeQBF/4HkwIId60BCpYDOAVXBhAyA+sOOgE8AwUDDwQPBwJY378tyZX0ccGVUftCMNegB1d3kFPW15v/OMm+/kcxPIdMjP7i3/sPHYW/bR1hulytETtDZXpdhz/yOBeBMyMkcZz9nxzvw3qpMEIHDRcFn6zrW3MdvRlKawG/z7C+xKTSwUAaMDXw725EGnRsIcCsyMwLp0SYEaIgJEE50+b7qgPaq7geYNrSkrpGNsCF8goHDAZpbYxrorm2cGFWk0LQdibCnZZ+PI66KtMntwz/N8edKhuw73vihOIniLXko0fxiu8xO6X6NSw2FyqJZc7EXDQ0YLmMddHAobPzdhZMjAFGgAEagAEAAAAAAAIAAAAJb2ktMDEuc3ZnAAAACW9pLTAyLnN2Z/////8AAAACAAAAOAAAAQAAAQABAEAAAAAAABAAABAAQAAQBAFBAEQAAAAAABAAAAAAAAAVAAAAAAQAAAQAAEEAAQAAAAAAAA==";

const chunks = {
  "oi-01.svg": new URL("./oi-01.svg", import.meta.url).href,
  "oi-02.svg": new URL("./oi-02.svg", import.meta.url).href
};

register('oi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
