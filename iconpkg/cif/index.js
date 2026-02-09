
import { register } from '../core.js';

const lookup = "AAABHYkYxxgoGrxT8FBURlNkc0YVV0KGRjlnhXNThAdSdFVYKyYMATArlAIvATmiARMBDE+PAx0ZhRMBRQERywQBlQMNAbUCqwECGComFS4CWMd67ffZXNurIWUnypCiol0G3D6Di3FTEj36n8piwp2O5/WrugbqNgF7PHLvcnjQ6DsBsVRUH24kzFDtFvfye7LF7V9yImvhjPv8THx4D83atxucYDWaMCs8eum2982PzEJHIn54YCGK6KpxKlevVOowyC+Jwmj4v5PjB5PuNLTb702Rt5lUrTV7uj4qX0uVLh4QF3Oij0ihE4LxO/i4Of7hojfhubaQ/aimUu+MYYAxPN/NNDxUVDPFmde/6xjJjG5eegvzLqnBRVAIABACAAAAAAEAAAAKY2lmLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "cif-01.svg": new URL("./cif-01.svg", import.meta.url).href
};

register('cif', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
