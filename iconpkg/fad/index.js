
import { register } from '../core.js';

const lookup = "AAAA34kYmxgfGlzv3X5QhENFg2WGY0ZGmiIlV2JlAVgeCYMBARoINIkDMB9UngMBURABG+oVvgsCBwMGIBckAliblIQ7FP8t0OmYIYwzoP44LpKG4BZeXSKCVuVpirc+gDsnG/Qq56Mjg84YhjByuuVevPQ/aPfEG2EupoKflklRO5RN7O8WsRctlFwd33PtO86dPNX3kvocz0PhTKlMxLGt7l2TKURU7wK+Qdk0aT0v+fG6SYI+640i4kW9AW8r2XnrHq6I41cwMLuGuTXdB6lD1tp4HqfT+WjmYyZEQICQRAAAAAABAAAACmZhZC0wMS5zdmf/////AAAAAQAAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "fad-01.svg": new URL("./fad-01.svg", import.meta.url).href
};

register('fad', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
