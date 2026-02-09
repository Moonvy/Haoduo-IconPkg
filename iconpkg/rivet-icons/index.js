
import { register } from '../core.js';

const lookup = "AAABL4kY0hgqGqRBo71VQTZDJFNENjlzx0I0ZVNpJkdnSIN4WDACpgEFCREOAo4BMQMp4g0DDSK1AYZPAwEDFAwHM9Er2AEGAhMICgrzAgMFtAXTAQ8CWNLID7kB7fJCJPTsn5Z/FVId5uxDHxXBHFcVvSmJROxtzICy3BAUVPQEyzICgr4rTjPV+v20cd4J3FYZ/X8G5PQy5TGgDV9r6D+1LoINUixzGySoQrckJ3whkTSw+boSkKNydkd6WWiArV1SKfLXaaxydYLGBXo8kbnIAsu6aHs24h3QjM6B1nD8CWm2P/EB2YRV2XQwcgI2YlBgJ/MVdv2GA1b51ghsB2W/PlYytv3PrQLc0bVnkpUJ8jm+i5XO5618baceuSBQMc+65Wwe7ZXD16tGgSAQAAAAAAAAAAIAAAAScml2ZXQtaWNvbnMtMDEuc3ZnAAAAEnJpdmV0LWljb25zLTAyLnN2Z/////8AAAACAAAANQAAQAAAAAAAAAAQBEAAAAAAAAAAFAAAQAAAAAAAAAAAAAQBAAAAAAAAAAAAAAAAAAAAABAAAAAAAA==";

const chunks = {
  "rivet-icons-01.svg": new URL("./rivet-icons-01.svg", import.meta.url).href,
  "rivet-icons-02.svg": new URL("./rivet-icons-02.svg", import.meta.url).href
};

register('rivet-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
