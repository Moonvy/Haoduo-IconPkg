
import { register } from '../core.js';

const lookup = "AAABP4kY3xgtGh8r3ttXSEaSZDS0VUVJYSR1OFRGJDdFQWR7YwRYMfkFHBIB0QUIChYBswMiAwjUFQTRAQoBFeECswECAQ4mHxIBggEBIQMIa5AkkAEBfQsCWN9xGdIdkpMNhz/WXLm92hFWsGGMF8Bt6/8WTFdc8sJltixha47aojg1HV0Bujz+EYHJxyGgHsHyrDstuJ9lxKvwJLrTMJC6hcBAMZU5N+JzbkR75qOwdjzI0MAPoTMmxOSb72wHCr8n05WdKnQx9HC5vkTfQUeKShx2hPoG/ayHKjswI2v+16ecTO+i+xdp80Z6enGFJLMaQ+K3NMMqztKqiO84ByA1rdEFdQNHNmCWpAxTARvxNPvJUb9gjEKffr93iUKMHbUazMEMqRelmP+dvs9CBzD7jOLvNlsLJ23XRhASBAAwAAAAAAACAAAACW9pLTAxLnN2ZwAAAAlvaS0wMi5zdmf/////AAAAAgAAADgAEQABAAAABAAAAAAAAABAAAAFAAEBAAAAAAQBAAAABAAAAABQABAEAAAEUAAAAQAAQAAAAEAAEAAAAAA=";

const chunks = {
  "oi-01.svg": new URL("./oi-01.svg", import.meta.url).href,
  "oi-02.svg": new URL("./oi-02.svg", import.meta.url).href
};

register('oi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
