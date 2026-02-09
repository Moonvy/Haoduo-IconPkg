
import { register } from '../core.js';

const lookup = "AAAAjIkYWxMar4xKFUpGdDQ2QqVThHEFVA8NA5IDAQaGASzBKQIiAZMD+gEMAlhbI9sNcNy3Bzk4x5qcokJCwd0zhxHZWg966GxSm4tpdmV1UcVT1j49vhZxcKzmbdCNtqN/rYd3qdskbaBZFrHWNwntOH5GU5NSmPN1h434lYm2/cK+mcuV0deNN0OAAwEAAAAAAQAAABBkdW8taWNvbnMtMDEuc3Zn/////wAAAAEAAAAMAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "duo-icons-01.svg": new URL("./duo-icons-01.svg", import.meta.url).href
};

register('duo-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
