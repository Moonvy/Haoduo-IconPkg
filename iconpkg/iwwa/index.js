
import { register } from '../core.js';

const lookup = "AAAAnokYaRUaESzY9Et0dlFTNXcnc2lDBFcYDCekAgYCFwwEIG21AgMDC5gGfgIHAwJYaWVGm1CuS7XNX2daEK7+pZC8C4EHHioH35WCAF3a6zrhUmvc+78roGlT5E5ebccpcNHXgs6Hgx/2vUgCp+wAIImG8izlgRO+YEoCeCwwvhvm12kzbWzX5UScOjR+hDmaCohopv0VZ63H1UMQAAAAAAAAAQAAAAtpd3dhLTAxLnN2Z/////8AAAABAAAADgAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "iwwa-01.svg": new URL("./iwwa-01.svg", import.meta.url).href
};

register('iwwa', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
