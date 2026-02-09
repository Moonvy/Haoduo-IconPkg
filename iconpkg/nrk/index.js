
import { register } from '../core.js';

const lookup = "AAABV4kY8RgxGuSzGd9YGVZThUNTQkY0VTR1WGUXOCRXSzdTGVS0VQRYM6MBFAIBEIIBBAEaAyYEBwwIGhkCASbkAVQ8AiL8AwMBwwQJMgFuAQUq1hgTFgjXUAwSCAJY8ZuUqJQSOGCRJGrhszvlwI9Avfy08xUKK6WecHU0kxu4M6Ex2m7qoOWy+QOxdQBsFP5479kwNmim6vtoj3Jh6CNo0qrPv1CVgkjQdvPrhJh0pRNdoETrB1Z9B2wxIYZiu9UhX4oqW/EHutJUeptQ2QP5JF+soCUZD+hUdei9w9eC1lgVqUmUqSIglIXcy/JK5cUwUWe2Gywa6pWPDnVzn7KXT5eSZ9BCuW+5AocYfv7H5m2CBPd9vtbRrtauWNMsIfqpTUAfetoeRie+9meT8iaFL9cpOVIe2UbHA9EuRsa9qVRfcNd5JagyczGtwdd8i5xHAAEQSAACAAAAAAACAAAACm5yay0wMS5zdmcAAAAKbnJrLTAyLnN2Z/////8AAAACAAAAPQABAARABEAAAAAABAAAQAEQQBAQABEAQAABABAAAUERABQAQAAAUQAAEQAAQEEQAAABAAAABABAAEEBBAAAAAAA";

const chunks = {
  "nrk-01.svg": new URL("./nrk-01.svg", import.meta.url).href,
  "nrk-02.svg": new URL("./nrk-02.svg", import.meta.url).href
};

register('nrk', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
