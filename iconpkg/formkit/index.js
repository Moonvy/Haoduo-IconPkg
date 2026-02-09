
import { register } from '../core.js';

const lookup = "AAAA0okYkBgdGvrLiqxPVIU3RlVEVkJjJDSlRmcHWB0iGxizAwUDGhQkDxGUARcRJA8BCAUXzwouDifvAQJYkDhbuoN9vrwezvJHr/kUACQk/C9fMtcpqbP4KgST2G6+wawnTgK3CzuwS0SHKalO11NRp6JveJ4xg5VxUKZGDEch9LpCdQQhqKa0ghUSt2ijps/L/LMyrl0Kq3E5lAziw/BTgTGMIJgbRbThfKMUoLG2Z/7n/N5pRt1IRA7y10EmjAdoMFHarbJjfu61uYw0CkSAQAECAAAAAAEAAAAOZm9ybWtpdC0wMS5zdmf/////AAAAAQAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "formkit-01.svg": new URL("./formkit-01.svg", import.meta.url).href
};

register('formkit', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
