
import { register } from '../core.js';

const lookup = "AAABIIkYyBgoGhi2kjFUgzozUmRENnSCVUZmRVZXZVM4RLJYLQRZ5i4BBAESDqcBAXYEDOYBASEfC0sKKEwYA44BC8MCATIKBQ7aBAMJAgHfUAJYyPvtS+Crhwjptw8gsp1HKkypy+TVOsgnHR1p0IcPP9NulZCZnp6l3tNNkP/VIfvmYlRLkoDjT13jDRjJQ06tU/wnRckOEuqY+doLMON+GjuR5sseQ67OmbyrceSmXQuHMPBjYxkTGzISC4+tNeXPHdrOxIc8HKTO7t5DBzTLncSNW+YcqVTOftycz+9QvSbUFlrKPKIq3kY6BLK5UzX/MQAw3BbE9Plus5Vb1xD0uxSz9wM06wiLnXyVS7uSv85oXSJc0CGsjs7JRUAIAAAAAAAAAAEAAAAKd3BmLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "wpf-01.svg": new URL("./wpf-01.svg", import.meta.url).href
};

register('wpf', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
