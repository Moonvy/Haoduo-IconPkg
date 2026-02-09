
import { register } from '../core.js';

const lookup = "AAABT4kY6hgvGvVLSvhYGDNHQjY1QmZ5Z2czRVcWZzaVNoZDNHN0Blg0Ac0CBAIeiAECFQICAhk9sQLnAdEDGV/FAQIJFhwC1QInWxADsAUoBGnIBgYCAQL1AhhrOQJY6vV4kD5pKeYy+Q/sn+gvghuyyTlsgObUmlYhGV3PHfN176009zaNrBKSXfL02qTk9xIoML5E0STnc/6gJurXRAPTk4tndll/f8lx4YPfw4e0VFdz2WyhCA7+MKJHbJBdtMfSydoGlbi3C+QtCkfGJWWw4/tNaxwP/4A4+3f/Sbc+PhL1g7JtA8S+B3etLI6mtIGoh12NpvAcvQA1EW2luFBLO8A4rLWoFb5HAKaDTcR7xB7P80a3G9DMQxXLR7u+00NdUl+qztK8gr3+7RUk+OZTFwcy/TTnO5IIor8AaQrXki1hX/v8c2uwW0YCADAIAAQAAAAAAgAAAA1pY29uczgtMDEuc3ZnAAAADWljb25zOC0wMi5zdmf/////AAAAAgAAADsAAEABAQAAFAAAAAAAAAFQQAAAQAEAAAAABEQAAAAEFEAAAAAEAAAEARAAAAEAAAAQBAAAQAQFAVQQAAAAAAA=";

const chunks = {
  "icons8-01.svg": new URL("./icons8-01.svg", import.meta.url).href,
  "icons8-02.svg": new URL("./icons8-02.svg", import.meta.url).href
};

register('icons8', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
