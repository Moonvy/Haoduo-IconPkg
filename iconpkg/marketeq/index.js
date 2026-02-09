
import { register } from '../core.js';

const lookup = "AAADIYkZAk4YdhpB42IzWDtWZTWnREhWSThVU6ZGVIclWANGkWJiR1RGFGNYRGU1UCUycjREpVhFJiM1pCRkdRpkQVelJZhHc0WWd1h0Ew0VAgUC6QKFARIMtgIYU2kRKAI1BxZmkyhaDCETBMIKA4wDXAQICZ0RAw0W/wMFFj0JHBEuyggOCAYKEAYHCwEDAdgBEAMJBQzNKQgOBxwMLgICpRgJDAkBRswEAy8GUgKVLwgCqAepETIIAxUHRYcGOgkCWQJOvv1esJAYbqHuQFs8nuanxLtJH8A0iA/mYshSky87EJ/WI9NHqn67LzppM9FkgpEFA4tdGdQgkRzCG2n1y9ykfv+yfpOhd3ZofI3NtxzVI/k5FVjBMr87Q3I8K2JTwfJfZxn0eVAW1vEsXd0C15SUgf8zdOl40Jip65CBpblwM+goMbXFNu/p/iUwHSjXTbCIAgsf2zyqzKV91kWuq+IzWAW/jOc2n/RHZtL52W/IMGTRaNbSnj0REn+mwbPp6P2NhuYiQsSs+CAxQU/cj24se2y4xEOdy12oh9QGwDTDAtW9GMN3D5QZQSIrP/qW/vSkuSmvBhHh27Z5VUgKKpKjehvy2yyQuOjn6hLPoYhSPS/uZZ2rtD+FEVxHvnbtRYLgs+GQMsPdIVDHidffP/m7obM64VlkwdaDkGpxOhyWT4p7XQFTfUQIpIW/Fv2L0WYaJlKvsBTrXKVPExwc5D0Zo5/orsjCyko4sySU5qNTGgW2W/esdCjaFefocCRpte7vZwPICdVZcxknYeRRJexLiaTZ3YS2m9UB/JQKnNv5+l1K8+qWtg1hMWdGBkJVlR+EHWQW9YgzgHqxOdOnhI5ug1akVY2TW/6AEuomwPwmM0LanKf+57y3iV3sHYul2v5vN0/z1UJeYLvTvNiVm8SOAZX1V/iZgNWD9KYJRYsPVwvheQ09zk/ICOM/cvH+pB8fhSki4afYAp2M7Sd5qNidLWFuLS5J0j1qbdO5lX8LHiKdSFSWmATW+QELQukYpbGJo5pwsUxCjPiL0fll1qxPAAgIgEgkCGAQAA6CJAABAAAAAAMAAAAPbWFya2V0ZXEtMDEuc3ZnAAAAD21hcmtldGVxLTAyLnN2ZwAAAA9tYXJrZXRlcS0wMy5zdmf/////AAAAAgAAAJSUBghqpIhJWYQCKUpqoERqEYYCFokJSFpagQFlGWqIqoFakYEkZWUlpIkEQZFKkRQSgSBgoYYFEIqmJWoZZSEghhBlSEGilYFKJGCJlSYpEaSaCVVISAIaiZRUgYQkEYlBkSBJFASWmAkGYmgaUQAUhgCCaSSqYqRJGFEQYaZSiGoaJVJiVhVEZamQYZVIAaIGEVgBAAAAAA==";

const chunks = {
  "marketeq-01.svg": new URL("./marketeq-01.svg", import.meta.url).href,
  "marketeq-02.svg": new URL("./marketeq-02.svg", import.meta.url).href,
  "marketeq-03.svg": new URL("./marketeq-03.svg", import.meta.url).href
};

register('marketeq', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
