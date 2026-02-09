
import { register } from '../core.js';

const lookup = "AAAAz4kYjhgdGkvP/PNPYxSWZIMnMnSGZkZlR1QAWBwrFz+AAQYrA/kBNgEJBAogSiIBBQ8SmwFADQIBAliOfjXFVXhJlz7tuv4TTnIzuJl5CRbqPycybUNqqA+85q7o8z8HV+opMDEm1DnpCetEogEKnSgeK5rAscuRXGpU0z+C7JmnZTAhVvKLSt7YwZ6wVrL7LjHUJrkvSu2OmlqoYaP3YzN4iVe2MeEd28Oe2wCJOAYH6n6LqnmRXDkHBZpf8l+Oj17ZicEHlZP8i0QJCAAQAAAAAAEAAAAMY292aWQtMDEuc3Zn/////wAAAAEAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "covid-01.svg": new URL("./covid-01.svg", import.meta.url).href
};

register('covid', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
