
import { register } from '../core.js';

const lookup = "AAABlYkZAR4YOhoaaO1vWB1WVVF0J5lURyd2GGNxRCSWVVNjM1JDRTFkhJh0s1g9ZCkDAiMUPf0BAb4BmgUJLoQDB+8BARHHAUMGHX8MBwUMvwMGGgEPAzIHEwECBwUIJwK+AeYLnCkFggMCVAJZAR79mL61EPuX0a3kOSEN8NdnSIMs+/TjHnO+BijNKSUjUHZdByQX/TRx/7C9abPK2RNXrekhFCYYFmOELndC48+6xx7T/3u337ttg8Wb5iQq+lER0owwfmFptAEtvZCZMrVHtltRtg9WqL+jkpynCG0BYx08JBhVUe51IhXug3HO+R4V0lEcvfCW/pKsTr7JkoSz8h4y99q2uXJHdYlsc2FQa4lAgB4yNu0FD7CbTt7tb59alQwbh6esYJDVb6/X1tWFevysoMU5LD6MlZwCG39IjVV/RQGbgbipKt0uybz3jeGOUsVBl/Z6w0aUICecOaaV2DB2BqJh2yqL03jRv77PpHMmqPh6k6mHr5SIXzdtRO9gLfMg8si9A46dP04gSBAAICGAwQAAAAAAAAIAAAAOZmVhdGhlci0wMS5zdmcAAAAOZmVhdGhlci0wMi5zdmf/////AAAAAgAAAEhQBARBFQAAEBABABFUUBQABFRQUAAEREAEQBBBUAAAEFVAEAAAQBAEERQQAAAEQBUBAABBAQABEBEEAURAQBAAVFBAQAQUEAAAAAAA";

const chunks = {
  "feather-01.svg": new URL("./feather-01.svg", import.meta.url).href,
  "feather-02.svg": new URL("./feather-02.svg", import.meta.url).href
};

register('feather', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
