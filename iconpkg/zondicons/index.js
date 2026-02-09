
import { register } from '../core.js';

const lookup = "AAABnIkZASkYPBrGwk7BWB5VVXZHOLFVNDNDSHN5Q6RkZTSlQRBVZhVlZTYlZ4VYOAwHGAyMAT1kNoQB+zUuLgkGCAIE6QEG6AiNAQUSgxIrEDAHDwefHgM8ChZpAhQKTwI6A30DC6oBAlkBKfjAfKcRa6eZ6awYaA6Qzv0UakwR0cED9BNGCazI/wsRm2Tel22HcmD6rjsHPVZyHA+/tnVhfsWBYDXrAk2nIrlig2zKs+jo/YthuRq+ophg+cRUvnVAnf5bVBKNiCgNST1K8YHBNoYZcfMdjp8znYX09y0cv1Jp7ZXs+P8huZoN+uJ7X9McNRVdI8k5zuWAQErs7xXJH9NpKudoRCY7sMZ1llCkaHOogbxd6XWWaCt/s3LaNvIEsSAauZw4cN8nDTi+BROnWKGmTT4XJSI8xIKjA7rnQ1udq7AUkdMNrtmt+he8we5VmnHP0sg081mZeWfdb+aRNAGdRjZ7+SN6P2F8cDmZIZFEM3rHtzZTrEd2tfvwBazVdb5CurUdIjCOk+jy5FqEGodVG0gABmRIQMMIAAAAAAACAAAAEHpvbmRpY29ucy0wMS5zdmcAAAAQem9uZGljb25zLTAyLnN2Z/////8AAAACAAAAS0QFQFFABEABRBBREAAEBRBAAQEAFAVUAAUEEABFFAAFEFAAAQEAQAUAAABVAAFQBQFBAQQVEAEBEUEARRFAAUAABRQAERARABFBAAAAAAA=";

const chunks = {
  "zondicons-01.svg": new URL("./zondicons-01.svg", import.meta.url).href,
  "zondicons-02.svg": new URL("./zondicons-02.svg", import.meta.url).href
};

register('zondicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
