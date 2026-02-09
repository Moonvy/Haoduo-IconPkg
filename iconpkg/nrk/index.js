
import { register } from '../core.js';

const lookup = "AAABVYkY8RgxGl98octYGSNlZKODJWakdBZldpgHZVM3UTRSlFMoMgdYMQEMHgEJA5sWB4gIDA4R9gMKXlsf6QJXpQOzB7EYKiSAAQYLOQEKBQKZAgkWqAYCBiECWPEp6qXGMWi5GJEbgtcUrltwj2gek6m5A3SXNBOb5SDceSFQ2WKVsX1W4dbTho/Sy4UOJ+uKQtp1lRI2ApRts1Ty9qUjlLuP8iHZ924lm6DzRhk5LmeS1yStgr7B6npgevl8nEmpM2EArFJfhaqEMC9zaAegUb0e6tdNMdDZ/iGL6Bq9lNGf0XWTanbxb0jWoF9UbDtY/gfXXUZwtKh1sqnWdSzztvuYAx84uq7vl2wDKyahRNrSKuUsMsX80Oi9c1TAUMfDJQ+o6zFnvuWmeAeCv/lAx+gVQE+H+jCyRhtYX37VIn0Ez3LmCiSUFWe4Sp6pRwIYCAikIQAAAAAAAgAAAApucmstMDEuc3ZnAAAACm5yay0wMi5zdmf/////AAAAAgAAAD0AAFAAAAAAAAAABAEBAQEAAAUFAAAAQABAEEEABEAAQAQQBBAAEBBAAEQAABAUAQUAEEAAAAAAAAARUAEAAAAAAA==";

const chunks = {
  "nrk-01.svg": new URL("./nrk-01.svg", import.meta.url).href,
  "nrk-02.svg": new URL("./nrk-02.svg", import.meta.url).href
};

register('nrk', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
