
import { register } from '../core.js';

const lookup = "AAACrokZAfQYZBpM6MGeWDITczemY1I7aWM0NZl3MoZxUmNFJGZlNkd1S2VmNXM1lVFnJzKWNTYzVXZ0QTqUQzNYJFhmAQ1pTgUzsxaIAQSiWh2bA1wEBxoCCNIa4A+tA1IECd8CGAIBVhYBCwIXhAELRwpFEvgByCcCZhUzzwEcBAd0FAILigMiAyUVAYUBlQRCXgQXKwYIAyIS4QwBAoUOAQIBAdIBDwEBAlkB9HgAghsF5TaGJuyfx5jfpCPJyT1pmqUGhngZR8B3DWxnxeXlpqQKYzbQRvlgNU3G1Qo59xnm4Sxdg1JPTIic+jpEOegkYtdk8m46/uMKD6fvHg/eF8LE7hP3rY43xhD6+3JwbsXizbzGYdkzCrf02rRLtp/2wveRUEuel4yZaADXf0qZ7+0KKqDDfhpwf43weJqTTUt/gF9z2SqGRR2eXC/UZW6huiSI1UlaqZAUwxtxOTnztY2Ef5IRSWZ3KaH7TWn4AvuH/Eu1oWYx+Cw1v92SLTtyEUlfPhyRnaDc9m8/OhLwSB8JsblU4DPZH++3xoxpEVGykyf+m/vfJeJbAV1zyzezf9Raf1jH+BnefG8U+JwGQU3NYdxJmCNfA8vUVhuJn+g+oC/4vpwy6TDmACi0RCtOUFk++oCLlx/LQF8Qs7tpXe+WKvDEuOC58ypXlTZ0yvAgLacFxXjqQWpGLyROsZkkwHcuJqmtXhWKGLTfawpolAD4chtsQ0unA1qYUr2OnGjh5HY8nDq74jLRW2DeUf02z379YDeRIRhw2FBnYTeTqEgfH7o4KEaI9mnaB/5QJZiej+XFbxzYauecTUvR1o+QUmcISIOCqeHkqYqR6Mvv3qtuV54rcIZQXJBb7angi/ozlUHUk41HML0Vazk6A4hYTQIFCEQBoAAAYahAAAAAAAAAAwAAABdzdHJlYW1saW5lLWN5YmVyLTAxLnN2ZwAAABdzdHJlYW1saW5lLWN5YmVyLTAyLnN2ZwAAABdzdHJlYW1saW5lLWN5YmVyLTAzLnN2Z/////8AAAACAAAAfZYgEhJFgBJUUGhZEhQlISIQZAlJlQFSlBmBgQUVREBlEFARmFIFCggBJRqEEFVQEJRVoimCAkZgBRAVWKKkqoAYUqAJBAkpWEElQlZVCIRJGRWUhGUolUQFFVEkAAUAQpUQCZGpRShUWmAQAQUAZAFQJVVWEYBlpRgBVVEVAAAAAA==";

const chunks = {
  "streamline-cyber-01.svg": new URL("./streamline-cyber-01.svg", import.meta.url).href,
  "streamline-cyber-02.svg": new URL("./streamline-cyber-02.svg", import.meta.url).href,
  "streamline-cyber-03.svg": new URL("./streamline-cyber-03.svg", import.meta.url).href
};

register('streamline-cyber', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
