
import { register } from '../core.js';

const lookup = "AAAC/4kZAjIYcRp9K145WDl1NFNzRhlHVVVWOEdIeCUxU1NFFkZxRzRURmhZdFZmQlVFI3YldGQyhMMIxiVYJzfGNjZYNFJiVgRYcA++AQoEDAPiAgN8DRwiBBsFVBnsA0cDpwEJSUoKE0EFDREZPwgHXAMGAQcOBTjoAgvYCBcDjQECGI0BKQU5CQkObBIZAbYBBB8CBAEUAuOFAbQFfINEBakEHwNLAyPrPgUHRAGcBxcBBkQDngEbJg4CWQIyaE43yJLm6iqt+azH4FvvsEiWJB02klG5ndYav1Io0zZxO+s+u+m2XiUJLy8LmwwDwdqWSgPgD71H6DghwPRtGjE55n0pPLyQbM2x+jTXRrf+gKQW9j7ir8Qdiq0H5AZTIbamH4xJUuaDjEq/ljOeJWhJARJtTtrIQv6LAagpJq7ilKxJaS/aHfNDvG/V2Hu1uscRFLpOcsGfa5n+iLO+p0M58vlrRupK5ycHz6sdocl1MuxMLqWXwDXmGu6YaVcr1OGU+cs1khvYjIafIu/r97F76Nfb8yG6DvqBlWRJCk9qKntgAGUZ0r1TCU2z92GThl1zxfu8KIzHh+SMEr2/k59/t8qKvl8qxHvaOAE/kAN3XNJAXMiioO7JViFuDDoHdpW8jmAfUH9QLSEkBFwkHOLVHTxxDPQtGubywfm/zIctEb/XBUjznQt6Et+na9VUxB3S0LZpQnCDRAO9cn7FHdII2h3JbCffJMtpkr4g3zCi73eH99ZxvdeTDnAXOK3xGbAOabxWC9N+YY8jI1wwLmz7EVNrP/vixqlgi2wc/rDDhIFB/1a/iSqYC24OgUCDBywr19h2NKz54tYpSJ024uxLWwkR6eRHg3CuyA2T8ZE/G+esw7hlkCoHQESwrMVzhLl6tFPCQjkwfoQ/zxXSX0llBetWMXdpLQ3IHpsS/Ys7MXshBgEie3Qftgc6guUP/AK+e+w8beseC+Zcz+a+O50GLdc0lV2hD+80S3Q8MyxoFE9ICCBggQQIQDAEICIABAAAAAAAAwAAAApjaWwtMDEuc3ZnAAAACmNpbC0wMi5zdmcAAAAKY2lsLTAzLnN2Z/////8AAAACAAAAjQllGIgaaECaVolikVVYEYIYCZlZoZRGGWlQQEJqUCQUBlCQqFkoJFhQiihWWkhBiYElBlBQRgCSABUKRRASQmAVAAWqpRUgZRFqJmlKQGEliJiEqCkpomURmUUmSAZqZGkGklQAJRgqSiAghlWBkFVUZqgEWQGpIkYJGAUEiVkZWEESkAhKEBhZJhBhBAAAAAA=";

const chunks = {
  "cil-01.svg": new URL("./cil-01.svg", import.meta.url).href,
  "cil-02.svg": new URL("./cil-02.svg", import.meta.url).href,
  "cil-03.svg": new URL("./cil-03.svg", import.meta.url).href
};

register('cil', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
