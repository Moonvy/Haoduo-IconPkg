
import { register } from '../core.js';

const lookup = "AAACa4kZAcIYWhq0BGnhWC10YoR1ZjNzZFI0JVVlcRlGVaG1JWe2RWZ2MnR2Y4ZUZVVSNTJmRbgUJFOTYnNYWx3fAgEVCr0GIl0rFwYCB+QEArMBGwcrAikVHkWGC04PFBLqDzWJbA4TCnGiGAcDAzNCugEBBfMBXgwCIxRFAgEuAQMXAgkQBgUQKAoSB6dBAgUECgHvCyQBwwICWQHCn9xQOo/azFRpFbDSURRD5ZxkPVAHhwac/LfvhGSJO8sNM51xeKgo7KsUjj0shFYIi54xRh6ayGxuf07sCbJ1FAqi//j0R5v1tff4tHS8qfFRQzDpbm43JOiwDSRMedhW7hrc6cUttcVPmdleFlesB5e9/BAOXFP19Lerrlu3DFDbfSl/E9B52OD8Fifvfg5k+jhLhKQBo487Bn/BkulApywHELpM0ohkobJACySr9fCqpINem6duZzjoaN3K8tKCKx9RXkBWUPww7H5jVKgTO8FyFTWwR/YjKKZ6LLhHiG2Rfiq2m8+ijASQA+GJARAuXyjtO2l2ssAC9Le/voqgDuJhoElii78pDP7O3BZj7IucrET11w6/2ZkdjWmxjCS0L5F85DACWYwI3lnUrGz0JodwJzi968l9BVDW4LRxX+asX33vjfo1t8ju9Uw1gP8vuLj/niFh1dWRyrSUy/sOYcCV3wAcGUo4ajcIehX9Fan21n5ZKygIdxqmrJ+/lv05FU0bJ4egF/jKWxMK0u2cIKIgbk7oviapemo8Kau5NCK9NhY+izhdPNK1CAtn1xaeMSosaZIeZaFEvVIMvrNbqQEITAAAiSSEAAgAQIBCAAAAAAADAAAAEG1ldGVvY29ucy0wMS5zdmcAAAAQbWV0ZW9jb25zLTAyLnN2ZwAAABBtZXRlb2NvbnMtMDMuc3Zn/////wAAAAIAAABxRZRAERRFhVBaBlIlRQYQBRVFRRWEgAFUEAQgAWZAVFEACWFFUEAIUWQRBBAkUAFRVFQRARVRJBUCRECUBViVWBYFAUVGAGSiYFAFRpEFFVBCFUQBBVEUQAWSlBUVUAkFiGAUGZAAViokBSEVVEAFEAIAAAAA";

const chunks = {
  "meteocons-01.svg": new URL("./meteocons-01.svg", import.meta.url).href,
  "meteocons-02.svg": new URL("./meteocons-02.svg", import.meta.url).href,
  "meteocons-03.svg": new URL("./meteocons-03.svg", import.meta.url).href
};

register('meteocons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
