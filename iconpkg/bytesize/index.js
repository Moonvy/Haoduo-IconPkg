
import { register } from '../core.js';

const lookup = "AAAAmIkYZhUaH43h2EsheElVGEkjRoNTBVSRBTL+Eh0UhAHCAgIDRAHGAQEuLQJYZjBlc/0kU7qHvXX+aL04I/RKUqa+Q38OgZ1GviejlQwnERtp1x44RPcyz3OCub5Y9/NQ9HuWg6unnUSMUFxOYMzXZyy/HpUHMCzHnwCWHgO/FA6sPirffhsLbbppray6hwzSx6DPs0MjogAAAAAAAQAAAA9ieXRlc2l6ZS0wMS5zdmf/////AAAAAQAAAA0AAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "bytesize-01.svg": new URL("./bytesize-01.svg", import.meta.url).href
};

register('bytesize', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
