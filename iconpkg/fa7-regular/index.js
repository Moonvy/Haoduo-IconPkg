
import { register } from '../core.js';

const lookup = "AAABhIkZARAYNxoZHYZoWBxYJDNFRVWDg3VElVtGM0ckQUQXZEOqWXNWM0YFWDznA48BJQMGBBoCZAsEApkFCIoINIYBCB7wApxzEgkIAvkBCAIDBBMCFQUrAgKFFo040wMnATIXB+cCEgQCWQEQShxNlQSi29Zaas1Vi4wTzdvHegr9cK3jEivsq5VpqoB2p0+8D9Mk5GmtA9KYfCrry4wdf4eUcIf0pJXLRcxEGQq2vYEhJq9j3ayLhdLFJxLsLtCECoL/9DKO7Gub8cuiCSUgfjvP0OdK5nWVC21Bp5Zd1B40SRdV8n524n2cZz0nWq+zrHfTQwhxvgcCil3x5iRIJz/a0Senirymj7ryU9pIPBibN/9r4D+hLLhz4haor6eeXqkW+PPlD7+WYd7trQQ5K5Mxm1iCPrlgsdwIG78lHHD+8aBS1+e7a3RyJIYMvr6OsO/Ucb/kHgPZibV7WRuB5YRE8VmF8pYGomAHnmItdPP9cyu/6eR01aqwCdBHAAgECCEADAAAAAACAAAAEmZhNy1yZWd1bGFyLTAxLnN2ZwAAABJmYTctcmVndWxhci0wMi5zdmf/////AAAAAgAAAEQAFEAAEEBBAAEAAAABABQQBFEFBEQEEBARQARABQEFAEEAUFEQEQAABFABAEBFFAAAAFBEQEEABEABEAQAEBFAAABBAAAAAAA=";

const chunks = {
  "fa7-regular-01.svg": new URL("./fa7-regular-01.svg", import.meta.url).href,
  "fa7-regular-02.svg": new URL("./fa7-regular-02.svg", import.meta.url).href
};

register('fa7-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
