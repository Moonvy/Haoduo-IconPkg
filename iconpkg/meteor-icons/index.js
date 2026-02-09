
import { register } from '../core.js';

const lookup = "AAABxYkZAUEYQRqAXBd4WCFzV3Z1UoYxU2ZoU5gkQXMVJVV1U3dDRDeFUVlSWXUVRgVYRQgZGDENhQIdYwQWGckDBQ8f3gH6AQcCAd4D+gIDAQsCZhUBKwUkuAQBD1+MAQYNBgm5AgPIAZcFJ4sHRT34BDkQOxwLCwJZAUHOmCyic8EXEjpjwodBcWddaR0eGM/IZx0wINtdceaEHImWm/AJP4mUtaq3+fFlbDqCA3pa7SYc3HvnVSWCn/LUeBFQm0dRVL6nVqaS8nvn5r3nrJLRqRVpWfZiXULD3iS+8L5Vu4ZsnKNtUKd3SLvtWzwuKiU9oL8cA19xHW2VYUkpAfM+Ukgf7OVgqT9HFQG5q4PSmX4CzjWlhO7dj3xltjbXePbCbxmVbGxpJWWav4NOsLlyaBwyLPDATmsvQ8tprSqsB/4jLFmMGba+qx15IocqMmGjVpafnJjWIBRiWewU8FjC/pvxc6NDPKHMR3+4S5CFiq9AICdp87vtjq9hKlgbXa9OJBPtlco6HiPiMHpSrL1YDLrmDDnDTqn0JDR20wqBy5vTUXUiJoAmYLkYMd0VU0QSATS/exs2+hHe1bhJADAAhAIARDAAAAAAAAIAAAATbWV0ZW9yLWljb25zLTAxLnN2ZwAAABNtZXRlb3ItaWNvbnMtMDIuc3Zn/////wAAAAIAAABRVEAQEAEURAFAFAVRAAVEUEEVEUAQBRREAAABVQRBAREUVAUABVRUAEQFBAAQQFERRQUARFQEAQQAEQABEBQAAFQEAREQQAAFAEAAEABVVAUBAAAAAA==";

const chunks = {
  "meteor-icons-01.svg": new URL("./meteor-icons-01.svg", import.meta.url).href,
  "meteor-icons-02.svg": new URL("./meteor-icons-02.svg", import.meta.url).href
};

register('meteor-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
