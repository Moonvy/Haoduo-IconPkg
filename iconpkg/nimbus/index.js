
import { register } from '../core.js';

const lookup = "AAAAy4kYjBgcGiOk9DhONIV3SFVjIWVYZSVmNlRYGwUD0wFChQSvAQobBikBB38NEF0PGSATJAMWDgJYjIGBBjHKvV3E8OIqed+naFAbtdJ2RIpABwoHsIJwhxUscQ8dz2jJZTtTxmu+5v4wHgG+xZ/+NNeMuhbzz59+rKaM98gg2QYg0mCjJHOVc2x14+ifbbrv2GyV2tNGlDSZ12iAHjshpYOLOYGev/2VHmwULayHyH1xB3pGZ0ypRLbOr8e35MXsEHpS4uuzRIEQIAAAAAAAAQAAAA1uaW1idXMtMDEuc3Zn/////wAAAAEAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "nimbus-01.svg": new URL("./nimbus-01.svg", import.meta.url).href
};

register('nimbus', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
