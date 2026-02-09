
import { register } from '../core.js';

const lookup = "AAACUokZAa4YVhohi5M9WCuIQ2ZHUjdiR1RkJkVWOmgndTM5JVOTVHdiVLU0QzKZRTEzc3NUWlOFSWgTWFkfhAMCCiobBxgOBAEhEBgLAioTESANBhLaHwKMBRkFAQQgARCTDggUAiP5CAIPuAH3AQM8EAMM0B4HBAwJ6QXtDh4BAwHxAgVICwPmCSgHAx27AYEGMncGAQJZAa4oFjSDFAa7vpXHlf1F5nGKmmqCRFpc4rSvU4bQBfMV42Fh59hEGJyg6xxzB796JY7ZTDs8FGaJDvK180ZW6OWvPqIMdr6/kgMx2T/lKfJoznzm/VkwQ6Cs6gvEslCY6DG8uC00+9cdkQmXIBSrB/hz/gN1gO0oydCUxYKUoNmVF4O4PAe55sINfIIE7B5c/JYTdjarbzh7eGivRBdfZ6AVnqAPJdD1YjAkcNkdnJSqqWyPbUpl3TiqQ0Wwfn8ouTSHbbXkf+JMh63gzpW6XYTVDBZEPqcbi6UssR4df4G93QfRXw0boJICtCz3i1+rCks5eKxyx7CtvuAf7DWnByOQIaaBqYOhiWNgk4dflBq01nqJEb8jOdAzIMqMpNpX2Z8Hst0bh2QThuS++6GErUMd727kEmvOQN/QnCufl+DZYDCfsHWNKsQS3Ej+BWQdcR4Ui0SWgWesqhRAPI3Cn78ApjdFhm0w6Ka/c1Ly7FuVyGnq9FT93XJr/gnE0iqQY3Z1rBzRpx/Xprlto1tcqc+2tYmi6J2+GKydz01WdAb52JE2ubBiup/s9oUcwG2NSwQBIACABIAEBwAgAAAAAAMAAAAUc3lzdGVtLXVpY29ucy0wMS5zdmcAAAAUc3lzdGVtLXVpY29ucy0wMi5zdmcAAAAUc3lzdGVtLXVpY29ucy0wMy5zdmf/////AAAAAgAAAGwgFRQERkERFFAVUABRRAVQUEBVAAYAGYAWFFRlEEQAAVUlECQRWQBRQURIgAAQRVBRBVARFRUVQUChQABAhkBZRUVVVQghQREEQYJVYRBVEEUVVAWBVQSUQEYRRSBZVEFSFBVFQRRCQABUSAQAAAAA";

const chunks = {
  "system-uicons-01.svg": new URL("./system-uicons-01.svg", import.meta.url).href,
  "system-uicons-02.svg": new URL("./system-uicons-02.svg", import.meta.url).href,
  "system-uicons-03.svg": new URL("./system-uicons-03.svg", import.meta.url).href
};

register('system-uicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
