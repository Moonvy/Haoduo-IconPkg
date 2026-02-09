
import { register } from '../core.js';

const lookup = "AAABz4kZAUkYQhphFvTMWCE1d1RiZEQqkFRkIWV0NiZINzV3cmlXhWZVU2IkRDSEiQlYR2IHtQExCA+JAQMBC94HAdUHAQoFAQsTA40CMQcCyQMJPQEEvwFh8wGsECD/ATYE6gIQDwICBQosEgEOLgUHBvwDmAWtBo4GAlkBSbxOxb0sW888bdkw0nvtPhDstD1GFrVnprPCOvq73hw2YV0krvOfUANDF2S0z/jm9mEKgsUWxguwVg5NmYGVL//AFHMd5H00TuxkV+O2VG6y/ZcFCrEydd87v016D97bBwHTwKm3938HNiNUztdT+ZX5ANU2+C+Ek2T9ilMmjgeerCmUFtx0m4aSBPi2hz26R/S99xjyVBKKpYKtWw6loiN6eHCa6xj9H9BUrdu+hND6DqlQEZ6yMF2v0enqfPlTE/EyLNrazHidTTNLIWerhj6HhSrjS4JE2RDOywqUHMmcvnbBrf7bHo1rOfcMGqnHw6Htz8g4Cz5rG5Ni0ButntJDMvXQFPk80jbWvV3f7ZDRr+38rvy8FfmFyTakuoNWTy03Ju8rgzTU7WDzMm6ouyf8h762UslsCqJtMhZ8HCsSN+5oAxoZ4hL6SUBBFCBIABAAAgAAAAACAAAAF2ZsYXQtY29sb3ItaWNvbnMtMDEuc3ZnAAAAF2ZsYXQtY29sb3ItaWNvbnMtMDIuc3Zn/////wAAAAIAAABTQABQBQBUEAFAREBAAAARQBEBFEAUFRFQUUUQEQUAERBQQVARRUBQVEQEQBAEBBFUFARBARQUUFAAFVFQBFUFBAVAQUEBFEAAAABRAERBAFAFQAAAAAAA";

const chunks = {
  "flat-color-icons-01.svg": new URL("./flat-color-icons-01.svg", import.meta.url).href,
  "flat-color-icons-02.svg": new URL("./flat-color-icons-02.svg", import.meta.url).href
};

register('flat-color-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
