
import { register } from '../core.js';

const lookup = "AAAC7okZAh8YbRq/jdOAWDdjQzZkJUNXJCY3NVRTRIZCV1NRN2Z3RnJWU7RDgUNUVIdVRFJ2cwZ0c0ZmSDtUSIVniGs2hEMDWHUCNQIFBwlKAQIE2gEJEAEpAfwCAw8HCwEDHhkBwgE3AiIEA3kbdoUB5gEPAZIBZSMKEwTOQwvTAwYHCgsQDogB0AEQBgIGBQQcbgbXAg8WuwEGmAEJEhOnAY0DF90qAQxFCVOkATku0wGaAcRcJjQCBbUCEwgCWQIfh/zFtEWg0Ak15jt9idPBUJ48scW686Jr986fItT3STXAFpx8/r53bhKIZpVAlWlC7Nqi17O68m6IBe+dyeNZqk9wxNxKDD6ke9zOHqYUU/xT0PlO0dsUMRAqu2i7PZ3cmPGR4FwFP9XXdbr8ekcUzInmW9OXoJEJk4EVYzeCiqzqSQ88+mmfNL+AVOGEQ/Y1szh45jPfvj7c6Scoy8cdmOacnQztqw21L9FKj8jlHiS94Tpg6CGOLQS0prj+ap/3kk30I1BVcaTSv0YcBXfcGBY0/nlb+b7yDrPuUbqz1JusJ3zlpTIOgLXvNttHUDPFLw8Np5LbXrlYdnPtWRy1Tm95vxokqdGqPXoyV6rX2rmBfhHX8+Tm0URUTAaYMCaBrNe+t3bLJ0kEk3G3jEaFMDU8Ca6b/dLkW+7JSZgSpaaS/HWe0HQ4aIc48Gi+VB5Waunk7naw/6ourzBt/muo5JqccNgV/cWwlRICyMXX829KErwY9n5Ks6R6Cua7U5nTCWvQrOUpWVM8z05qO+zsbav2pIHiQRFp8ex9o43e6IxG5qoQYaBB/1kWv0MNih4wKn22gfCQBpMqvizj3ij3AggcaDNhK2/37SCkQg+EEYVPG+R3zVhcGx25udX6Vg8qnT2AC9COAohP3eb3FF8SiV+0BzvlNJQOlawwHRWA2mwv+T/h6s4QBgcu/Loi6siU5iozvyI8PwW6SXW9QDGzTsAAAI4UAEABACAAAgAEAAAAAAMAAAAOY29kaWNvbi0wMS5zdmcAAAAOY29kaWNvbi0wMi5zdmcAAAAOY29kaWNvbi0wMy5zdmf/////AAAAAgAAAIhVmSYYZlGGKmlhFQWIBgmUlFZRgWIRgGWgWVlFkQImAEGQIgWCWJEYoZJIBBJlISEQqFgRQIkWBYglViEEmUJVGigVSGCZAmRBZZglFhRRlmiEIQGmIlZogQEgSahJiFFEFFESCihoEpVQASRFBJCAiQSYoKVkAQkGWaaBCFKYEREhlUBFESUqAAAAAA==";

const chunks = {
  "codicon-01.svg": new URL("./codicon-01.svg", import.meta.url).href,
  "codicon-02.svg": new URL("./codicon-02.svg", import.meta.url).href,
  "codicon-03.svg": new URL("./codicon-03.svg", import.meta.url).href
};

register('codicon', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
