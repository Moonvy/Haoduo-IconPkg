
import { register } from '../core.js';

const lookup = "AAACbIkZAcIYWhoU29CWWC1ng0FVRjY0U3U6SVZnZSRjRnaEZjKDRkREJbQzVyVSREWEhodoM1JYNTJlV4RYXL0BAgcLBhUCBzMDBwgWDEOXAgLRFxEWQ9cDFQhGAQEOAmN+C78CdwIBAwLhBboBDwEFBgcVASbstwEBB60BGCMCAgn6AQLCAm6qAxZzBAUBF/wBNQMDaQgMIAV7AlkBwk0BhAxPO1x+FrWUQGwmBLJ3iwsIL1u/tcwQUCRM8KNk1W4IY3+3bpmPFNgUOE6oVis1qwcBGXYejcU1bmFAal/8rBXSyWExDh0WgCA95oe3Tnl0KL5eyilER3pt7KInetD1yug2/j5/2bfbDrUIYc41nkqwtCH9bpyeLac4v5/len30NAXujJHB+9zXE/WsiQdS9Jt+9ZoxJGT40tU4O0wVBr1Wh0M47N+bVi+8DgG90r5Gkqx9KvYCsjceAPIqywKSJ+EpWVd+nP/4qywD9bCV3qJQaRY8aRXA6dkrhw597YswFMhLEw4KO0T30iS3KA240r1otGk3YxawMB9nHLQpyqFZUEOhJ6uQJhp8C/hixe1dphOxCIsQTPz/jdipqQqPt0dxjuRpojnUf1Ogs7mrFfxuLg3dnUcMifW6dSz84pcaIKAorNzBzxdRDCyDUOAWkUAI/XFRSWQIi1S29Oygy3JfXniKZDxUiIxw9q4sv9de9Mg6PRDgqr+mpFmcn4SnXyJbFQe0+qk7jCTxZajp7zPWgty+UDCIUYRbnAZnnpEb1u+4vaxqfu6y7/qk6yjolsCZqWz/6Ans2iPpeZs4uEwwEADAAAAAGgYADAAAAAAAAwAAABBtZXRlb2NvbnMtMDEuc3ZnAAAAEG1ldGVvY29ucy0wMi5zdmcAAAAQbWV0ZW9jb25zLTAzLnN2Z/////8AAAACAAAAcSJAAkGFVAUBRRQRVBAiEVEVBAUVFlAloBYBBgRVBREZkhVQIREURFWZJRBRUUCEUFFEhhFFRAUQBhRAGRZISCUAVVJSgFgCAkFUAYAgQkRBCgElZWRUUAIRaFUUEFRBABVRBQJkBVRFQJREUVUARAkGAAAAAA==";

const chunks = {
  "meteocons-01.svg": new URL("./meteocons-01.svg", import.meta.url).href,
  "meteocons-02.svg": new URL("./meteocons-02.svg", import.meta.url).href,
  "meteocons-03.svg": new URL("./meteocons-03.svg", import.meta.url).href
};

register('meteocons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
