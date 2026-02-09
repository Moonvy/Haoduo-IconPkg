
import { register } from '../core.js';

const lookup = "AAACp4kZAe8YYxrGHkBaWDJWOERkhVUkRmVgZ3RkeVZnZiGTWERCVklUVUNFRIVBQjmjNkdBtGxEKEUjZ0ZFRQhGBlhkKAf5AQUDCgx/DHkBXgcOAkWSAbsBBAELRcQEqwI63AEdClMD6gOJBQsOCCIE+wcTIgMBCRcaEhYFBIsHDAKtAQIGnQkLogIQAgT+U8W1ArcCAgUWBBACA1QTAQ0bBgefBA4BNQJZAe9vOmWrrAMf9pjOWiK1UjpcUTxldqLKjO7XfH/tb4MdDqzYIRiPYNMSk82UfYG2Yd/MUAZxqbdANLvafzD92g6Jk8KH3hcarvXJjHHm68teApvmXyG4jnOnwi5gKCqGaY1vRrE08q8/Vv6XfwvWlEiPXMhTPXjfKsmA61Bps1tFPPhaZ8afnM4lQO03ubZIh4aOdetOFTYb51vvidbRtuJxS8qHZGwjCXtDH7U9oYDwMZGbeUjtPBvy9EZIV/eUtZIa78skOXEFUbCn7K0QzhNwOuU5MNyizc88iNmyoViyERC0YG1cQavQQECknPtyx22psboRwfKtvcO5TdC3HjHVozjCxlfJ20Gswy+JFbvB5guPeqM8WNB3X7qu2JQyix/D3HnQ6CGRxieRcrIwiUaYiKGI7SqTg/YQ82HLRzEVSULKD/k+NvxlxQBfZ62vuHq2GyF0+U21XbeYAUIiru0qV+S62EWbeDgyQjyWXZYeKnMvcVyy9NRlgxLjh9Huzq3jnbnu9lFeEqOZwtjndUVqn7lHCOe7En4mwzBhQQT3b44Tj0HCURBt4qaysvaDAtBTUbAPZ+tRr7fP3Mp68m3pIkhT13KdnXcHpJdqKq3BiFEMiP0lNFdmtlWbbGGB0f1QKG21Er4T11alPbVEgiNNADQEIAyFAJAQASCgAAAAAAADAAAAEWZhNi1icmFuZHMtMDEuc3ZnAAAAEWZhNi1icmFuZHMtMDIuc3ZnAAAAEWZhNi1icmFuZHMtMDMuc3Zn/////wAAAAIAAAB8FVGgQZqVFIgCIUUCESJGEAFkWVVlBCaBmYEWhEBKJBBYlRVEBFBghpBiGYRSRRCGERSRGAoEEQZmUWkRlWBRWCBFFlAKIAgFUCVQAglBJGhYAphmkWVQBBFYBFYpFgSVABEZClZQWABGEUJRUJZQiERZSVhBUEUEIAZBBQAAAAA=";

const chunks = {
  "fa6-brands-01.svg": new URL("./fa6-brands-01.svg", import.meta.url).href,
  "fa6-brands-02.svg": new URL("./fa6-brands-02.svg", import.meta.url).href,
  "fa6-brands-03.svg": new URL("./fa6-brands-03.svg", import.meta.url).href
};

register('fa6-brands', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
