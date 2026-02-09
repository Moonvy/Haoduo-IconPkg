
import { register } from '../core.js';

const lookup = "AAABrYkZASwYPBqzxDB4WB5SRFM1R4NJeBp4NYQliDdSRzVnhVWkY1N0dGUiMCVYRgEHCAICAwNrBgSoBFobTQ3WJ9kBlwIpAyAEDgP1AcwJtwEDAgmYAQEJAaUDF0ywARYRDpl4Ah0EUgHwAwivARWvAQEGHwECWQEsgdEuoLVIBmP4laecKHNeycKTHPbpXzAwTmdVAB5c2xWq/bg/pTxonAsGcp5JeTGs2EYYHVyHmpPIeHY4pVK6qAzuDqNxXoin5vRePNEw2uGRH3SbCfh6m/aSYxOIwNOPs6UrdDiTSQLfrIecvb/nnD9YT5hPqj3mz4TfLm/Sv1DBc4sjkfDGxj9k0PTj4HP5wFao/LB1t3OvyKub+ONH4LPMC81CrpFJKYoGTC9paoUVvN7BW6CAO0ne3+MQnoFgQ2gKBLRSP+6x+E8SQiqnchQFM7QWVAxxDWObvGtGaxV+itrIBPPx4YRXZ65yIwN5Bg2bsO8Mhk0ER6G6X0tBkUqRcEgkaPlzEx6gwMfSkRp2bXy9v1NeO4T+T0Tb77bEtCIoFpMNT9oUeVRXSAQAAgAAAEABAAAAAAIAAAAXc3RyZWFtbGluZS1ibG9jay0wMS5zdmcAAAAXc3RyZWFtbGluZS1ibG9jay0wMi5zdmf/////AAAAAgAAAEsQAEAAEEUUAUAAEBAAABBFQABQUBEAABAEFEARAUQEUAUBQBEEUFQAFQUEUARQQEAAFVFUAABRAQFEAEEQEQEAFVAERQBBAQFEQQAAAAAA";

const chunks = {
  "streamline-block-01.svg": new URL("./streamline-block-01.svg", import.meta.url).href,
  "streamline-block-02.svg": new URL("./streamline-block-02.svg", import.meta.url).href
};

register('streamline-block', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
