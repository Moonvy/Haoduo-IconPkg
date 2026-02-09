
import { register } from '../core.js';

const lookup = "AAABAIkYtBgkGlaX1rJSSFUmh0Unc1VSY2RyJzdVQ2K3WCO2ARV9GnsGHyANMAFuCQYkPgZLPocBPRkpBQQEAVSEAeuSAQJYtNzPn5miNAolgc6uUJXp2Xv3sCLesJSWc6bmF/6Vxe1gFR6/nzxg0NcpjFueaaxTEMS6He+MihUF9Htt8lqwuliHpxfPUqy9V2gBmKPP8z87XZXFB+TDJNDJ0rytxddrAh4wnYAt/cqXHbcbVmls+V8UMqwCRp3yNtrhKfettanntTPm4X5T3Db9/xZRdT8szkaTqXxzny6+vtNiW2CQ1s4YJA4sGJeSSvg4kgl2ER6+Axt/+EUgCEUCAAAAAAABAAAAEW1vbm8taWNvbnMtMDEuc3Zn/////wAAAAEAAAAXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "mono-icons-01.svg": new URL("./mono-icons-01.svg", import.meta.url).href
};

register('mono-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
