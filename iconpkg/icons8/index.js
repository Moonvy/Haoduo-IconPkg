
import { register } from '../core.js';

const lookup = "AAABUIkY6hgvGn8PNchYGIRFGYcVk2ImdlY1k0lVU0ZXdyFjZTQ2BFg1AyklDaMKF74BGJcNAu0BiQFarAMaChIECukTngQKZE4JLDABARGzAYkCAQETQT8GBeICAhICWOr/Uv8cEv4IO5UKL617O3FbOHOa9f29i7fH0nN/ySnTBxVryWGm+cS4poMtvKRr49pWLM8ZAKXoA79HFQjmkg/A5oPqtK34JV+Sgx01zA6sC9dQRwADtV/zFziH5OyCtL7ZSQBLh4DT/tfnc7tXJJ+yB8TQFY53Em3nXVlt1GWNVLcy2pJDD773NL3fNoEwPl1sd3geIaK3R2lEPiYboQqAEjmqRuT1qNFT8PzJEe/+vhyQR0OgbMb099KmqKIo4b5EPl1dfzTyje3OuHWwrBv7TXawss+0MmyTXcNngsQky/sG5jCQLfvzaU1GIIYAABAAAAAAAAIAAAANaWNvbnM4LTAxLnN2ZwAAAA1pY29uczgtMDIuc3Zn/////wAAAAIAAAA7BBABAAEAEABAEBQAABUAAAAAEQAAEUAQRAAQEAAAAEAEAAEAABAAEAAQAAAAAEAAAQAEAEAAQAAAQAAAAAAA";

const chunks = {
  "icons8-01.svg": new URL("./icons8-01.svg", import.meta.url).href,
  "icons8-02.svg": new URL("./icons8-02.svg", import.meta.url).href
};

register('icons8', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
