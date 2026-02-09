
import { register } from '../core.js';

const lookup = "AAABEYkYwhgnGjhIBMhUQYZCOjdDVYNEclmCeWUqBTUlVwZYJAYBlAIHqhIBuwIFHAUIA1HUDwqhA48DqQIMVpcfFyEHRRYENQJYwjU/W9fSjL+swYZoKRsV2OC1Jq5bYFgJ/aeDL5XJW6uLbX5YohrE9qu5mPCH/gHDCiXRsD0dX3wvfysS8mUH3YnzRFVwO2RJJnjPvwboihRHUv77vHWOAToZ0WyMBdshKldWaVsAB+Z7nKGR1sC6nLLyGyVa/vM0oCAVog9AHbByvdbrEbd5OTa4znQH6WPZRlv5NlyVHHYIgkpuUkRW+z25DmBOWOy5RuoHieMPvqjjHOSQcJ96AKPsHOLuLLqkvb9YRRGaRKAIAAAAAAEAAAAYc2ltcGxlLWxpbmUtaWNvbnMtMDEuc3Zn/////wAAAAEAAAAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "simple-line-icons-01.svg": new URL("./simple-line-icons-01.svg", import.meta.url).href
};

register('simple-line-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
