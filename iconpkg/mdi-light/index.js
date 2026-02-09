
import { register } from '../core.js';

const lookup = "AAABrYkZATAYPRptgcz0WB92YiSFdYMxc1ZiWGUyMnd1RFSINENGhIZlWEVFNKIEWEEq3wQpCwvWAyWoAQEmAwERMScf3A0MMjECTzUt2QEcCwEp0gTdBRMFHyINAekCP8sDmAFysAYSHzsXAgMEAZtEFAJZATB8dspTSZujs1NQSlraBxZ7X1HdLDygebiMc5UqM8VXKv3BjtFfNYHGNxsqw5i8vg3riyEhoeSw0m1wfCeMDb0iHQFi6+tmPzfQypXdbIW9fQAxRgC8iPLo1r97FHIicGyt5GQY0ANQygRQnc+VR7YVQaxHaf4k3oCFOL9+rzI3bGsFLv61httHu9z1R170IdJ85WdkTpzo9Uc+tLRP1YoPHNJbjKx0tqNsfQvsO3/RICmlzxjxM6pg1hvsc61sXX1Mz4nkbdXBFLy5kIzFrR3knUg2SFjH3brO0JcJYCRzeKxBP61WbRDbYMaNaUN1JeKVrNJ2BL/WR1qEB9d1ClPwEjC/ICga1L6U16gPHgBNNAURGPcbwujjZ6enMGsekGd7MpBdHYTz8ugmTSquvVk1SCQQBAuAAAAAAAAAAAIAAAAQbWRpLWxpZ2h0LTAxLnN2ZwAAABBtZGktbGlnaHQtMDIuc3Zn/////wAAAAIAAABMUEABFAARFEEQBABAQFQQAAEFAVREUQFURBAAVEABQBUBAVEUBAEABQBABEEEQAREUQEBQBQABVAAAABEAEVQEAEUBAAARAEQBQUEFQAAAAA=";

const chunks = {
  "mdi-light-01.svg": new URL("./mdi-light-01.svg", import.meta.url).href,
  "mdi-light-02.svg": new URL("./mdi-light-02.svg", import.meta.url).href
};

register('mdi-light', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
