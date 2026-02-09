
import { register } from '../core.js';

const lookup = "AAABp4kZASwYPBqjyzOKWB5WJlNEUmRclFYUdzgkNjNZoiWJQ2smIkOVNFRyN1lYQC4tDyoBARkCB/AbQRKCAgs1DJ8CWs0GEw0DdAsDCKgMBALbDRuvPbwEAQmsKQlNBQIUKIEVKgMCK+8CCQfbFgUCWQEskYS0dOC0T9+2717ACg1OSAaRH9G4FONScpxj9HEDQhwjOIiHcwT85mljdb2nmP5K3sCRoQtxgfiRvPYLArBwP3P5YDtrZxUV4QSgXHOqmwyIxk+lLuMGY0RTx7C/gOZIbxZPPNDbUvaanFYGyVSF+KebT4oYwEYvujsk0QCrTKCvv6CESWpVtBJ5Q4u80v0/3ttH2F7uK6yRqJ4ebWisuq4zqg6oxN+bFXPfzxrN7waeV5V4gRPS2ijxpVxyDMh5Hg1yk3lJt490wci/kpHuT/O1RqUM0+BrWKMdhhAwaL1QItoUP5z0OHMo6TDGk5sJzElLZ9oxXnbBMJyHaLE/FklXfg3wX8L5hKc8m0LI54o9+EFe4Vt8KlQjR7MpTV8ErpMTduMFerNkk/guSJgACAAIUEAAAAAAAAIAAAAXc3RyZWFtbGluZS1ibG9jay0wMS5zdmcAAAAXc3RyZWFtbGluZS1ibG9jay0wMi5zdmf/////AAAAAgAAAEsVAAAEAEAFUABBQEEQAQRQVAQBEUAEEAUEFBQQUAAEBEQVAUUAAUQAEEAEEQAAAFFREAUEQUREABUQUQABRQAUEABQEABBQFAFAUAAAAAA";

const chunks = {
  "streamline-block-01.svg": new URL("./streamline-block-01.svg", import.meta.url).href,
  "streamline-block-02.svg": new URL("./streamline-block-02.svg", import.meta.url).href
};

register('streamline-block', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
