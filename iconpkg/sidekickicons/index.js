
import { register } from '../core.js';

const lookup = "AAABR4kY6BgvGnEKEqdYGEtiFGVSSTdpdSdVR0U0R3c2RTSGKDI1A1gumWABvAEDGUUPcgNSAp8GagcEzgNXWQMQGwsNC3ADGgEVAw8CAyZBiAcBBgcSAQJY6AOYcXvUXLm5rsGkpGO4G39pW9ocYCSVkh2iM3rgIjO49MUXURcTe9ZMUeW1URUSOu0JUx0l71a5zJ4hSsBAF+2ewnVCpGonvoMr1wwwUZez4huW+UjxeMTaMM5zW0RFYO3+mpc6FnAOrNxbUgfH0UXm59YSTt1u7uRAibSSqjyVphUVJ7ujojaPJ1ll/4NjKT84yEQp4TfEF6UDFW0k4DLdMjfP7/NkMfhLJod3n0oDWFJs/FefOVAb2x/Ar6Q2ZsX4p8DkSy4/u+fjQ8thY6Ax8fMsDroaxlMiw5V0y+Ev0WRQi0CyqypGJAEIAAgEAAAAAAIAAAAUc2lkZWtpY2tpY29ucy0wMS5zdmcAAAAUc2lkZWtpY2tpY29ucy0wMi5zdmf/////AAAAAgAAADoQBAAAARAAAAAAAAAAAAAQABAEAFABAQABQQQRQABBEQRAAAABAAABABARAAAQAAAAAAAAAAAAABAEAAAAAA==";

const chunks = {
  "sidekickicons-01.svg": new URL("./sidekickicons-01.svg", import.meta.url).href,
  "sidekickicons-02.svg": new URL("./sidekickicons-02.svg", import.meta.url).href
};

register('sidekickicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
