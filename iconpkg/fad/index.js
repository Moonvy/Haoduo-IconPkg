
import { register } from '../core.js';

const lookup = "AAAA4IkYmxgfGhbHDhJQcUhzRVc1RFZWQiViO3ZHB1gfGLABCQEcTgQWGQkCBgUwCAkIAgFR140BBRj5AVIMJAJYm9kz+aA4GG/m985p4b5d6RdoLlYvG+8wgk3WI+1dvM804EQqPIax9DuNTDVFO9DsY+udvXIWLZSElvpc5/njPv6I95/VIoZDSWjdsaeCKYIH9FQthnnuP2GulBZpJ86MK7qKt5IirVe5o+WYHfGS2iZJLuVeUUw+MEOD/4CpMKnf77oBFJMhOxtzAsSmPV4eeOse4jvE2ZQc07tBRAEAZAAAAAAAAQAAAApmYWQtMDEuc3Zn/////wAAAAEAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "fad-01.svg": new URL("./fad-01.svg", import.meta.url).href
};

register('fad', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
