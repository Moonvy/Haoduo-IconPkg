
import { register } from '../core.js';

const lookup = "AAABpIkZASwYPBr72C7oWB51JWVlSGQ0M3hjZEhUgWQ1VyRCpDZZZUJGNJU4W1FYPRUfVQEXqQIHAtYBGAECAZwFiAIFNhIx+wcaARfJAQoiMVIZBgMCBgzBEwMEGDcSHwECFCkCQr8BB9BUAygCWQEsUO+4VD84VgsMkwlXsR+buvaR0ga9GJ4okaVGiI9PUh1vkenM7ttfkZqshDvRQnnwHHgogdpeEi48LrzBVaeHvR6KR3PTdnL5sKXjXklM0JKVE5sMaN9yk7qotN/0c7abKeOT4WeBv5tr5ip8o2j0sE8vtNiFqBYi7h7H4Ocw+MBHiw5PXhrJ4cgMwvNgr4CRaEl1wTyR2vgxzwST2kSYeRC/T8h6pfwVVyMFX0k/Y3nEhHFTAz+GfklYqwYAFva0oNundhVcv5xU3pxzBs3RTyPGTTOsDbNCS6pKvASzAvm3BKFS8UjSFJ4USHO1+MAw49/eXHR0hHL+5mpbwD+unGttK3CHQzD4E2mK4EabO04kDWc4iP1xp0FjFT1erqAGC5wN72RzY6qgxsgKSGgAAIQAAAwEAAAAAAIAAAAXc3RyZWFtbGluZS1ibG9jay0wMS5zdmcAAAAXc3RyZWFtbGluZS1ibG9jay0wMi5zdmf/////AAAAAgAAAEsBEQQBFAAFEFAEQAQBURBFQVUUABAQFEVUERUBAEEUAQBFQBFEBRFBEABABARQEAQAUEAAAABQBEEAAAAAVBAUQBAQFAAAAABVRBAAAAAA";

const chunks = {
  "streamline-block-01.svg": new URL("./streamline-block-01.svg", import.meta.url).href,
  "streamline-block-02.svg": new URL("./streamline-block-02.svg", import.meta.url).href
};

register('streamline-block', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
