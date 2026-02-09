
import { register } from '../core.js';

const lookup = "AAABJokYzxgqGmhPD+NVYzc4ZXdVZHRSRUJGRoNEZUNYNiSVWCoCjQJeJgpBN1MCCQ0MF68BGw0BKApLDAHLAgYFChoIBbICCCEBCwIQrwUCWM+nbKz0KEFdgAauHuJzIblVOg+rc1O+CXArerYcGZXJaVZ+ib0KZQlgrMT4E53qYIfXkRz5IXZXbFKWrKEiu/wLKKGscHE7LTA+d8+PsG+d33UdFMgboqYUB7Vl8lIC8a39yhUYChEDDDYY+YG+RpiS559/Q2wea7reAsc4I7MFyZNNnr6rP1sL0sWs5D6Th+d3KIr2lMngaRsMdNPDDNobS6vwHPZ7oC5EYc/jyKeEuBUDoHmN1V9GFfUBM3p0HjHTPdxtgR0sNC1oETn4N61GKAATAAAAAAAAAAIAAAAQZ3JpZGljb25zLTAxLnN2ZwAAABBncmlkaWNvbnMtMDIuc3Zn/////wAAAAIAAAA0AQAAAAAAAAAAAAAAAAAEAAAAABABAAAQAAAAAAAAAAAQAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "gridicons-01.svg": new URL("./gridicons-01.svg", import.meta.url).href,
  "gridicons-02.svg": new URL("./gridicons-02.svg", import.meta.url).href
};

register('gridicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
