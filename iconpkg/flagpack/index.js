
import { register } from '../core.js';

const lookup = "AAABaokZAQAYNBqLyNi2WBojdkQ1RyNVRXc1eIYzVhNGZkZFVFVlkkVHK1g0AgFRKwQQBgOCAQQCF14BFQJGNgbZBbICEmwTBgMBHAg9NDYrFgoJMyscEg3yFlIkRRL6AgJZAQA2PpC6XhAV98JU62ChqvyQ19PrjmCnVx3tmveZPEiMYu9yhcXci8WP+Grb1SFlD1xrPOo8NB5WoieR24xMVPd6ijJoLnTNVHjn6ZlIxQZ7mTfYYw+2e7miOwH7jDb6ECIqsZz+9avf6OqinxKirc2yKRgHSyQqYHsX4YmTX/g+q6jmlX408fzvR8qAk1DMbo/QolZPzHivv50qPTXa/6szem7IiMEfiny48pDIVFO3M9lyVoITInE8/eg7cd33kPNdrrqi7wYBMAJzVCFfpk3t4RtCyrQwzecv6cG043un4QG2PMK3v2x92WVq2Ro57TVyg8l6Fu4uqSthUjHqu3hURwACACIAEAgAAAAAAgAAAA9mbGFncGFjay0wMS5zdmcAAAAPZmxhZ3BhY2stMDIuc3Zn/////wAAAAIAAABAAAQAABAARVAEAAQAAAFAEAAABQBAAUQEAEQABBERBAABAAUBAEBQBBABAABBQAAQAAFFFAAAQERAAARAAQQAQAAAAAA=";

const chunks = {
  "flagpack-01.svg": new URL("./flagpack-01.svg", import.meta.url).href,
  "flagpack-02.svg": new URL("./flagpack-02.svg", import.meta.url).href
};

register('flagpack', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
