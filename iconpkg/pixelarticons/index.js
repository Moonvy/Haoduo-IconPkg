
import { register } from '../core.js';

const lookup = "AAACm4kZAeYYYhq1SU+DWDFVWWphRVE4V0NBZVI0RTcmM0Rmp1R1MiGXaUhXMkVkZhd1eEaUVlM2FGRmY2NES4KCWGIQD6oGG9AVA+YCBhU0+QN8MQIXH2IFDAslBccBFgcCAwo8PZoB3hwCGBwoATPpCMscPhsHzQMOAwIfVgkkfT+xBbcFHigHBe0JbAJDKAYBFRUkAaUBBYwBAQWMNwgB7QKzAwJZAeYbWCBfr/Kp888zaWpZHpNoXMWT5pO15qjkPBicmBfZsB7gMcD2yJV+xxMxVUtzMGBO/sIC+QnDJR7dvnWYosdzgHL/l6sCFvxrGxfuzah1Boh+rHBEJTlG6tw0kfapkBxg7GTnRCp8NjHHo6GRitQ5MGDbHSxP77DPQTfmY6rasYy+dTCz8+YSnEkBbj/+X5Q3YbvKn0p4c3elwdY9IPdKuzU+NGRsChy/pwrQF5B5bcpljLVzIAnQ8iDIJvXrTUdKPr/zikcsh5DYrbpUzGZnzWkszm4Mmx2Jgn+FPCLeD1LLw7GlCq5BgaZ7J21pH80FT9eVTPxv94P8QDuQLdjJGFBMdh9XiN0MPZTn2QCpBAut6rHxUoxV547S0TMHO/M1RP/uLofd+cXTwUHVwgsdp3vfigAkaB6cFlBGqSTTsDd0lmOCoQxoDbeCzsNaOvD7yFMDr6x7pm8ynsGnJt6DyiW/6L75lObZx+RLyAY/MmzNPk4OjPYMaey3/V128hT0J3qonPa+Y+GGoZAnBbCUbMVacHD4t+WCETEfMDYXixFE+kv3nXKklSCVC52yZIOVFgHjG7Nqe2v9jJ+m3pDLUd3K6YZnDFX56FNx+Sn4WggVVDCVS4dxHZJwM0DixrnIzvuB/WBNQCRFoABwgAECiAIAAQAAAAADAAAAFHBpeGVsYXJ0aWNvbnMtMDEuc3ZnAAAAFHBpeGVsYXJ0aWNvbnMtMDIuc3ZnAAAAFHBpeGVsYXJ0aWNvbnMtMDMuc3Zn/////wAAAAIAAAB6ISIBGVkFAVQUBgFZQURBKASUZUgGBgUYJUgCQghRRJFlZVJFEJCCUlBACCQYUIRWFBVFlJWGVQFgYQhAFRGYAAKBAmgYGWZQUmERSSVFEAIlFUZJQgElBVSUlpFBFgRhkWqUQVBCQCBIUBSSYWGGRJESBkFQRJYVBQEAAAAA";

const chunks = {
  "pixelarticons-01.svg": new URL("./pixelarticons-01.svg", import.meta.url).href,
  "pixelarticons-02.svg": new URL("./pixelarticons-02.svg", import.meta.url).href,
  "pixelarticons-03.svg": new URL("./pixelarticons-03.svg", import.meta.url).href
};

register('pixelarticons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
