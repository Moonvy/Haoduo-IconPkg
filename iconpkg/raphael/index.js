
import { register } from '../core.js';

const lookup = "AAABd4kZAQoYNhrmuhZGWBsZREhWRmZWVnVnV1RldmYlJDQjYTh2ZENYUzJYNuAaBh8QATNoDAMWC1UaQBmYARwOHUEBA0sRd7MDBAIRAQQMBQUBVogDBDsSiQEDBNgFAwQdBAJZAQoSqkLey/nKh1sAp4O0xiXRXdDLdNdN2h7FgYh1OZ6Vbwcs6iz5+bCHRrmYLUIGSB4QlJtdpmK3ib/ruxf9sEKpf1xD2/FytERMWAfOQwchVr1T8CmqG0VHogf6LBsLOO5pTr2qJ61TRW0RLfMddnDigXH5x7SuwaaAMDi+XehTG/S+14B0CvnXvmVzQlKpgxxDls7vljyMK1ZYu6hB8+HkcxvYFqCeal3K41c/BW4MO6akB7tgWzx+eu6dhwyxZ6HHeynfIhwmf0IOBw7W+/uVQNcYlrMwxhUy8FvDXtflrRSoDKezgF3fCqgCsqZZml1+Zim+Mm+w8pThNOuHRFLnWJ+kszn5vFCrE0cKAAAAQgQQAAAAAAIAAAAOcmFwaGFlbC0wMS5zdmcAAAAOcmFwaGFlbC0wMi5zdmf/////AAAAAgAAAEMRAEUAEEEAQAUVAAAAAABEEUAAAAEBBAAABAQEAABAABAVVEUQAQBAAAAAUUUBABBUAAAQEQAEBQRAEBEBAAABRAAEAAAAAA==";

const chunks = {
  "raphael-01.svg": new URL("./raphael-01.svg", import.meta.url).href,
  "raphael-02.svg": new URL("./raphael-02.svg", import.meta.url).href
};

register('raphael', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
