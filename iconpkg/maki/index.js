
import { register } from '../core.js';

const lookup = "AAACTYkZAaIYVBpblO1ZWCpUciNHdzRWYmRVWVUlQnFIVkYzw5QzXFaVhmlik1NWZRRyEjhzU3REV2JYYSARAeYBA1QH8gGbAwGMASEDpwEKugEBCdoYCHEEGgEB1AbNAQM9CiEBEBAJ0vUBHr4BBgW8SxTLAh8e/wckHcAQAgSuAQbMCgSZATQFGwSWBIoEApcBBSkgbAsm0wUZAWICWQGiBiPkpvUtS5rE9ossdcP/SQau+f/v9N3mbfKwYXkkeuhzcH6QtPt3nVh1ZAf/3RDtHyNzKbRmBGVBh/K95wscUvMlE5Kq+imk25ccS4WcpPdhhd18cqcuG3ezcHxW647T1j4okJ70yubo2zK4DmCvXkS+CeC56oboaTNWkxtvqq1Gi68OWwFQhJbm+FOG6XggbXyhnRx337YQYmzPCMZ9N3tg8EWYoMZHSVW9ozj7xZkJzUjLQNCb3PX0Onw37EyL3I9mmjyvW0B9ctzKvlgXBb0KhDoNrfgnjjjbKXrI8mekMQpAbK/1xkvW/ZNjkJb67Bc/9WufPqY5b4wnHq/IGYdlNy39jxQKUjWsFtvroYtcx5GHLIf4mQt9v2Jkd1onEiMH+XIMxLhFv9ZSqzJhWXL2WXiwJMpcj0CvfGcC/Qb5EoDA+HZ4mxw1Ys7YUsox7VTEu9khVLGSHHAQwPtKHeSn8vzgAlRPxew/wUc8LHUCxTZjiyNNupS6n70BS7wS/jrlhCZuQuWNnrfaozHGz5PFD1wKkgzZ2QZvxxH3uhHvi0sQBAASAAAABDYBAAAAAAADAAAAC21ha2ktMDEuc3ZnAAAAC21ha2ktMDIuc3ZnAAAAC21ha2ktMDMuc3Zn/////wAAAAIAAABpEBARAVQEZlAlAVBRUUAFEQAQRBQVUUVUERRQAZEUZQRVUAFQFARSEVVERZBRUQBUQEUlAYFUQUBWAAAVUhQJVUAAVVUFUEVAREUQRUARVQGQFEBVAIERQZVBQGAGUVREEREQARAUREIAAAAAAA==";

const chunks = {
  "maki-01.svg": new URL("./maki-01.svg", import.meta.url).href,
  "maki-02.svg": new URL("./maki-02.svg", import.meta.url).href,
  "maki-03.svg": new URL("./maki-03.svg", import.meta.url).href
};

register('maki', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
