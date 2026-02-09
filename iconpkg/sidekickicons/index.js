
import { register } from '../core.js';

const lookup = "AAABSIkY6BgvGiQaql1YGMYjRhVDaFRWkyZGZSVGNlpqZjEgaHFEBlgvKY+SAgU6BgsKCsEDAhYDQgfOA5gBAQwBC10ES2sFxxctRhkIqAEBAQ0YigEMAzQCWOjDuqyXNzAwz/57RHeVuMWiA+ZEauA4YaTIou+DF6WeG1ZKlz8OpvkXUSJkL1G0Jwzxrxwu47nbe3NxuDbcn6qfi39LsiLlM0JFTFI6UFEHp8t4afQXOhXR1NpcU8aWFaRLWyfvzvyPcGAqFRK5MXXd7QPxWCXaISQsG1v4binXKcA/4RYy5B2aY0XA1lkruf8SvifC7Z4TQ3rgHzMOkltTZGySPAOVJLuHSCZQxNbu+OIJF1HLY+1lMqTkNsAa0XTHoDGuQEBgThuJ8zeDOUBXq8GzFbXnxaQd56NmY92VmPPhSsS7zFJtRoQgAApQBAAAAAACAAAAFHNpZGVraWNraWNvbnMtMDEuc3ZnAAAAFHNpZGVraWNraWNvbnMtMDIuc3Zn/////wAAAAIAAAA6AAAAAQAAAAFAEBAUAABEAUAAQBAQUBQEAAAAAAAAAAAAAAAEAQAABUAAVEAAEBAAAAAABAAAAAAAQAAAAAA=";

const chunks = {
  "sidekickicons-01.svg": new URL("./sidekickicons-01.svg", import.meta.url).href,
  "sidekickicons-02.svg": new URL("./sidekickicons-02.svg", import.meta.url).href
};

register('sidekickicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
