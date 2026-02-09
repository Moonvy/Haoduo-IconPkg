
import { register } from '../core.js';

const lookup = "AAABSokY6BgvGmc+J5BYGHUxdDZJU2NEaiVUcURDWEc0hVU1kiSGClgxmQGEAQUDngEVjQMCX2gDBoEKBQIeAiMMBQMDQQQeDggQA/kFMGwRAtIDIwID9QOJAgJY6BOm2hvUh0TnDiLDQniXuqKSdMfhpNyktDrtRDA3Mh8q80C4N+dAxEqeFQcW3eBL48u5Y/h7n/nEp1vbURc2YE6Lam2gzmTAe58alRc4JwyybhIpwq9AQ1HvZRVIle7kLLnmlb7kwImkY+1FnlgkFWyiPyvRCeBwIqUljzlWUylMOvNZA1er0c/vYcE8XOIxA7XGEqS4JFD/ZD8h7ciDaRuac5e5JwNSMDbFzFJblmN3YFGz3csxHRsc/tq7qib81h1LDpLxW3ovM3/XwKOYddasMydQg/FxMhf4F1Fm5eFKLlPFFfSuRbtGhBRIAIAAAAAAAAIAAAAUc2lkZWtpY2tpY29ucy0wMS5zdmcAAAAUc2lkZWtpY2tpY29ucy0wMi5zdmf/////AAAAAgAAADoAAAAAAUQEAAAAFAAAEAAFEAQQRAAAQAAAAQAAFABAAAEQQAEQAAAQAAAABAAAEAQQAAAAQBAEAAAAAAAAAA==";

const chunks = {
  "sidekickicons-01.svg": new URL("./sidekickicons-01.svg", import.meta.url).href,
  "sidekickicons-02.svg": new URL("./sidekickicons-02.svg", import.meta.url).href
};

register('sidekickicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
