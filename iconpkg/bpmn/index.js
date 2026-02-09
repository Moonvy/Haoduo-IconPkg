
import { register } from '../core.js';

const lookup = "AAAApYkYcBcacWa5DExXhzZJNyNUIVc1dAVWExUmtgZHAvwJBGUBHgsDDQYHAwWAAwJYcESDymWhW8IT3zqR5f2GdkPM4j1eVzGtegkyQBOdH/13tjWI37/UsUVqgPiEtfgM5fh7CFJsZgcXh6SMkJtIJwD38kmSOSee8udHPB1K5CbD70YRlRanduR6kwbwlwOkqgteVCbEMMREp4kl09I8gR1DAEpAAAAAAAEAAAALYnBtbi0wMS5zdmf/////AAAAAQAAAA4AAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "bpmn-01.svg": new URL("./bpmn-01.svg", import.meta.url).href
};

register('bpmn', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
