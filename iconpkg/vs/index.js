
import { register } from '../core.js';

const lookup = "AAAA54kYnxggGrZbKoBQhSZWJWdENXUyeGNmNCR3R1giKuEBJAEzWgIBrwE2FwkUBjbmAgo6bYYBJCcHBRp8qgNaDwJYn54Q/DjzodnA2cI08WOckuTS5zFCPLT4AQjnKC03X7T8xh/1vGj+ttp83ykXf3/IFfT/QSVtW/6SFVx8Mva0UTvRqQEorx2U5mN05Gj4lRjP/KBqpo0ngrzQahfbEaSPaaInvApQU+MF4DKQZqatVEF0dyktAU7vUpMYRL3DR+KmTX4dmhosehwVVoJqdNZCP403lP0I7ffyY5KpQTLy2EQAABEIAAAAAAEAAAAJdnMtMDEuc3Zn/////wAAAAEAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "vs-01.svg": new URL("./vs-01.svg", import.meta.url).href
};

register('vs', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
