
import { register } from '../core.js';

const lookup = "AAACsYkZAfQYZBrcYHHWWDJEVFZXRkY0lzdEdziHJRRDQmM2ODdZRnNJY5M0hFd2ZGV1NTYytEQmQkZUMRhSVahkhlhpDAkQGw2EAmgDPgEIApEBlxAFBgICHBCjBAFqhgEjHwMEAZoBBwMvAT0KowwJpAEIAvQC1AEDBqABBaYEBQUFrQRnHkU7FhUX5QMDFBVdBSWQGAQDAgUNJgYKBgRvARJJDMgE2hYKCzJNAlkB9ARgzxBcc1vDveZj+RHm42r+aTPF9ph+ra1Jm5g2AIM1+mD4jZw333FoLYpfOZMMvXDFwC/XOn+1hk7wiadoXe8LVZO+72k5dsXpcPBm0LQqp0i6xJoR4RzaxQqG1bnl3hjUBgJuxlKeIalAtWEKTWlozUsFn26m5smpMJllRI23ePIKOtfC88th938BXUcHhJs2f63Gl5k6lbm/OmjfiO8KsTj4pEgxGlxXUtoq4Ddy5Dk+3SlISW5vs5FYnVpmk4AjS0YHvRDZW0z33iYfRYg0qKEZ+JgU9vhJDZL9QUSQiHZNgnsoPVsgeAQkwvsSw3MqnLpGywr0clSDnu9e/pG5d1b6H1ByUJLZmLgoly/r9gZHGzV3qVec6Jw8u5mg0ui3DzJ/k3/hSw9uS1KLA2nRJ7v9h0okX1oVQatXThfiMwlsKmyOy+JNXxseUDe83CSQBdFLbx9+x6ndusrYsZ8t0OKr+ExDfPATYDLVCOA5kQP6nz9w7/sAkZUYb/BrpUsrJT5JCvb+tkZY7lEZAICpZwbV7Y85UB8krcCMTepaxmQuFdnt+l3J3sdnTZZYoKlNUTeolOexG5CLhuTmG5ykyxTeHx0RQZwsjKBw4S8ca3+e9xkjLJ50nnPUNzBhjuwl8+jfMwNZxnf72A38NgD3ZY2zTYIAACgDAAAAoAFBAgAAAAAAAwAAAB1zdHJlYW1saW5lLWN5YmVyLWNvbG9yLTAxLnN2ZwAAAB1zdHJlYW1saW5lLWN5YmVyLWNvbG9yLTAyLnN2ZwAAAB1zdHJlYW1saW5lLWN5YmVyLWNvbG9yLTAzLnN2Z/////8AAAACAAAAfVhhZEYBAaCWZIUSZAIZBmCQRWRUAICESUSQZgkIVVFgBkEERFqRYKmEIACFFECQUJEUVUgkSFhaQAQUWVhJFKVSVkIgkCYUEhVhSCUIAQUkQSVBBAFIRFoWgVEoBUVhCAUFBSoFVkSVGiJBRGFSFBpBIGREAWhpaliEZVVSAAAAAA==";

const chunks = {
  "streamline-cyber-color-01.svg": new URL("./streamline-cyber-color-01.svg", import.meta.url).href,
  "streamline-cyber-color-02.svg": new URL("./streamline-cyber-color-02.svg", import.meta.url).href,
  "streamline-cyber-color-03.svg": new URL("./streamline-cyber-color-03.svg", import.meta.url).href
};

register('streamline-cyber-color', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
