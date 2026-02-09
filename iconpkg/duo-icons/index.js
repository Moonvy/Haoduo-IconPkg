
import { register } from '../core.js';

const lookup = "AAAAjIkYWxMa2w3Ov0pkRTZ3RUFzdFEIVAwUAQtLBc4DVTACBAZYCJIBBukIAlhblVJRN9u+cNZlaZxCjZiaPm0kcHZTDdEPm1KtPTNCjYd3tmyLo8I4k4f980YHCejcy1OgtuYWNyPdWn9ZOcU4wZl12db4qcesiddxh23b0KJ+jbexvu11FpV6EUMABAEAAAAAAQAAABBkdW8taWNvbnMtMDEuc3Zn/////wAAAAEAAAAMAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "duo-icons-01.svg": new URL("./duo-icons-01.svg", import.meta.url).href
};

register('duo-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
