
import { register } from '../core.js';

const lookup = "AAAByokZAUkYQhongXUfWCFkVWRTRVFlZTmTN2pURERqhldVI3BTh3QVZFZkZERCRoJYQgIiBQIEfwIOEAgfKsUBExbTDgG1BqwBLngEBwEQDhGbAitOkQcwSBMfCBlaoQEFCRQNASx9DhnyARkLIQIQKQWzAwJZAUkzhUMKHMHIGL0vqJ5Uijv5XX+67QW1vm0Mxz6CFMAm0ZKTPsJnTQSvOTLR02sPa0PzaKVQCoSt94J4YbKGW56+wwf4zPjtcAcXCtbLhtCVMrpUDjy7g9tW46ksLfyNFuzmwKSB2wP/NhjOyXOtz74LU9pH3LwD+oSQ7c9uUzax2u1LRhE0onrVg30QovlEVPmsT01dDiH5HdmeN2fS8ROZVKUcnDJdK72uxba0I782/fX8biYWL1cLEvfZYOPXlcWa6qn5tFY3trbe8ksw6XwBFmQ80Bbu1LLQfDIH7ySObab3KqGvKZQV/vg+CgCKdJc9OMYU/OyfTbfiU5M9J6tsdmQO/YW733oS7amueIcss9KCTs9hEDZ1GxuUKxoy3xk2ZNKtNBK8H7BSHPr0Ovoj85sezjDQh63921DJyd69TutbexqHYvad5EkABCIAgAUCEAEAAAAAAgAAABdmbGF0LWNvbG9yLWljb25zLTAxLnN2ZwAAABdmbGF0LWNvbG9yLWljb25zLTAyLnN2Z/////8AAAACAAAAUxRAARVABQVEFEUEEQBARQRFQEQBARAEEBQRQQBABAAQAQBARBAUQBFERVABAFAFBEEUAUQARFAAEVFFRQRQEQAEFFUUAVBEBEQQBAURRUQAEBEBAAAAAA==";

const chunks = {
  "flat-color-icons-01.svg": new URL("./flat-color-icons-01.svg", import.meta.url).href,
  "flat-color-icons-02.svg": new URL("./flat-color-icons-02.svg", import.meta.url).href
};

register('flat-color-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
