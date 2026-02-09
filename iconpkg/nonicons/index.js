
import { register } from '../core.js';

const lookup = "AAAAbokYRQ4aHHj460d0RkQzZUlkUAiRAS4BEQYBBSkC/gcEDQ4CWEU/BSd/BSkrsgnirLivDueHo452yEBtOYPlxUCmheaT7iotu31RVaMLGWHI2xATdYnBORXA5A7ltKV9pUzsKjrN/8N5+RJCAAAAAAAAAQAAAA9ub25pY29ucy0wMS5zdmf/////AAAAAQAAAAkAAAAAAAAAAAAAAAAA";

const chunks = {
  "nonicons-01.svg": new URL("./nonicons-01.svg", import.meta.url).href
};

register('nonicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
