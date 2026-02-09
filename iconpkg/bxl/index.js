
import { register } from '../core.js';

const lookup = "AAAA44kYmxgfGqaAAfhQc8JUVDczU0VXWFNImXIjA1giAzoC1qICAzUTUIUBBwNfCQETAZQCLgNrWRDiChQBIwIEAQJYm68SlFyhR63PpymwXMB02GovBbJRSINOuebyeFPIQaE8V45Rdq8OxjqdIbKPJvr2f7usvWMqHs14yQ79iIFS0HFeplDf8lSygkfLGa7YXUMCOaeDPAFnsBMQww9+1lyixreposuOZSpgDdBI0LfwiGm2JG+bdkLeccbKZ19LKvfJQqOMywy1NbJwRgAwuCzC8nF97LS579MScJRgRAAUAAAAAAAAAQAAAApieGwtMDEuc3Zn/////wAAAAEAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "bxl-01.svg": new URL("./bxl-01.svg", import.meta.url).href
};

register('bxl', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
