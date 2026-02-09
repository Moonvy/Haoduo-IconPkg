
import { register } from '../core.js';

const lookup = "AAAA64kYpBghGrZPyeNRJEhTVlU5NzQRRTVDqFOpZwRYHwZ9AgdXEBI5ggEKFAMQAQgFBQUBnAGdAQIGqAILNAQCWKSn8jKKvpv0p2uzPkN9hJXslQTLN7/maU0dPzlrvufW/UqV0QnQjPMc5MXedXPb2SHUqq3a8tImCqQ9q+X+E+JID39Vfp6qjG2p5Ls0Az8uKyRioiUnaafkWYdxvNDzFg924O2FEsui5b5TgHwtcbkkCoqEsV0cnCzTRNutB6BSguzm10Gm/5talTuvsKgxlnRJtroLYEQIdJTy3I8Z8QeHexiLjkUSAEMQAAAAAAABAAAAEmZhNi1yZWd1bGFyLTAxLnN2Z/////8AAAABAAAAFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "fa6-regular-01.svg": new URL("./fa6-regular-01.svg", import.meta.url).href
};

register('fa6-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
