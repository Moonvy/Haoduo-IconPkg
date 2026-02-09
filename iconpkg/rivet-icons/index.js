
import { register } from '../core.js';

const lookup = "AAABJokY0hgqGp9DdjpVVUNzliakhoJZJXQzU0tWYxE3SDVFWCcmGAEFC1Evqg4ZMNQXA9sEbF4LHwE+AgMH7wgKKlTqBQJMEAgFCxwCWNIrYCkV2TKVbJXWgiDD1fzOVOyBy9HI/XE/cP2CujzyfL60vpE/MuVHnzm2MWINKQcBzO3PVq0wNgmorIQCfBxoDcj0a7DZPmwd8acSAcHczlK6Am1f8wNnrXpCXdd2Fdy15QYCUPlpixV6uQ/0MzLiJ62GxjQso/LsJxBVlpGrQ1byHVZClR5yUhW6BLV/3pCSCQJysr/9JMtXLuwIbWgJ0Im55oKAuSEkdFAFGYzXNnb9G+d71qAfZVn5UrbPvejtRNwkgBTkHk4xc2ly9Pq3dX9GAEIIUQMAAAAAAAIAAAAScml2ZXQtaWNvbnMtMDEuc3ZnAAAAEnJpdmV0LWljb25zLTAyLnN2Z/////8AAAACAAAANQEQBAAAAAAABAAAAAAABAAAAAAAEAAQAAAAAAAAEAABAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "rivet-icons-01.svg": new URL("./rivet-icons-01.svg", import.meta.url).href,
  "rivet-icons-02.svg": new URL("./rivet-icons-02.svg", import.meta.url).href
};

register('rivet-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
