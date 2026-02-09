
import { register } from '../core.js';

const lookup = "AAABQokY5hguGrXSeb9XcnhJI3RERRw3FGl1WERkJDY3dyZmRVFYLSdPdakNCgcbTwMCIgfNDgsFggQpFj7aARIBBR0mBQIGBsgCggSFAXYCYRwUNwJY5tYqP1UVfT+3zQ8CEF2UsAAgkJhNvwY48h9Zsqo4xJxMsoJ6OYlCKI0ajaxc7v+6MvzSea15LKCgB0tl5X+2jg5QyFR/SAeAaLSPODmxW9arw2cx9rB8FZJc0mTBD7o9WQrp70YfSXrLvtjewV15p/nteCIs3Q6sODNhS5Vr7k/qYTr8mufRyq+LzbIw9mVi0s0lED6NNuG1Qak9+keeiqkOpO55oZabvq3ktxezahXtAtfCGFtMgzyoLthXeAbxJ8nXft8/Hupf2FXlr52NvzxzJmMqG4RWtyTZIn5a3HKTQQQXc3JQRoGACgAIEQAAAAACAAAACXdpLTAxLnN2ZwAAAAl3aS0wMi5zdmf/////AAAAAgAAADoAAAAAQAAAEAAAEEQBBAAFAAQFAQAAAAAAAABAABEBQAAQAQAAAEAAAAAAQAAAAUAAAAAUABQABBAAAAAAAA==";

const chunks = {
  "wi-01.svg": new URL("./wi-01.svg", import.meta.url).href,
  "wi-02.svg": new URL("./wi-02.svg", import.meta.url).href
};

register('wi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
