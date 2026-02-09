
import { register } from '../core.js';

const lookup = "AAAA7IkYpBghGig0AmlRhkVWSYZCRChXRDUyJnaEhQBYIHa0AwYGASItBQLaCCsk/gEgSwYGBggCGRUOC94CAc8IAlikltrTrXYtqNCp25srquTZJAqKQ2B7WpVECv7zB8W/ivKHPRInDweMpnF80OwIdCbLlYyUQVNrpzvmheSvTRiwSKuigod15ae8FjSqC7bi5suLYrqcJA+e5dZ0N5Xejx304Kd+hLPyfwRxCUqg3NcyohkcUtGE8gNtST/xRCzbrbnsXf9pa1nUMY4u5/O+c5scuxM/le0+gCGxaf19pL45VdK+5CVFAIyAAgEAAAAAAQAAABJmYTYtcmVndWxhci0wMS5zdmf/////AAAAAQAAABUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "fa6-regular-01.svg": new URL("./fa6-regular-01.svg", import.meta.url).href
};

register('fa6-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
