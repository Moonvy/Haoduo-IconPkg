
import { register } from '../core.js';

const lookup = "AAAA3okYlxgfGjGqNq5QIlcUFUdDVldhRnh6VjF2BlghAwNTYxQIjwECCQiMAQwQF7kBIQKUAcwC2hjbARURAQ8LAliX5r3X/3AIU4TymyTjvlLHz3IT8oeWWt241b7sahmCHu0Y7FgEossMJB39F4Hn608rr/GWdvKBsy4Sk3qx5guL1iaF0I4/KkiercvFN0R385WnO7AgoKKWjxLs+DJ/5AKpjPEka+TiSgkn5A9wGyU5P/GtLWlg2qdIHo4H5bnQdNR2zRZpBq17GzyACqxBqBYcCX4hJSf+ukSgAAEUAAAAAAEAAAARZmEtcmVndWxhci0wMS5zdmf/////AAAAAQAAABMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "fa-regular-01.svg": new URL("./fa-regular-01.svg", import.meta.url).href
};

register('fa-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
