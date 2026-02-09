
import { register } from '../core.js';

const lookup = "AAABwYkZAUEYQRrxDIhwWCFSNXJXZZZqc6mFRFU6ElMiZlYRQ0ZKZDZYV2cjUlVINAFYQQQeAQHYAagBGBgPC60CqhcZhgXzA5UwCigQEATiYwIfLQOqAREJBvACBoYWFgosFweNASYGKDYFAjoeHqABEwMCAlkBQcKDFb8UkgF1JOUe5h1d8VZQrdMZA95V8pw2EYSfWBcdOR2mYkPC8mWHKnbtB13zP+YVRJgg5kcmuKIqy6mw5xtIr05TJyZ61VK5lfZfGUcs7RMsp5k8lEn+ID6A7Ykv0wFCqh2/fmlzuCQ08He6vp80WFh7577W7KcRLAlHHMxWXToKthuSeCWj+k67MprB8HG5c4JbecC1YFGceyYc1E56A2zbylC9adfdjOwpHtFOWZWpXUEctsMw9hS+8W2WIDZsq6CCSyRgZyO7bUhAoRIMYfSQPTx/Q3KbLpu7I6u3aTFoNVSjaVms0r1no7/nhFmlYVX+rInuOmEyjuI/h2zPMPlv3ZbcacuvuXhl7RXCbMhR8AKpIs6DhoGbYyV7UvAiDPNizsOVKh8BmKy+a5sYimVxrxKFfCXecVoYjyocOkkQQBDOMACAAQEAAAAAAgAAABNtZXRlb3ItaWNvbnMtMDEuc3ZnAAAAE21ldGVvci1pY29ucy0wMi5zdmf/////AAAAAgAAAFEBAUUABEAUABAEAQVQBRREAQBEUFEEAAVRBQFBBQAAAAVRBQEEVERREEBAVRQEBAERAAFVUEAEEQAFQVAERRAFAEBARBUFQEQBFRQRAAUQAAAAAAAA";

const chunks = {
  "meteor-icons-01.svg": new URL("./meteor-icons-01.svg", import.meta.url).href,
  "meteor-icons-02.svg": new URL("./meteor-icons-02.svg", import.meta.url).href
};

register('meteor-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
