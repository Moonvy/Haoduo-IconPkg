
import { register } from '../core.js';

const lookup = "AAABcIkZAQAYNBpDTdGTWBp0diZEU6REYgSHVTNzNCR2JnhmhVJlNKUkdlg6GcUBmwEyAhEJApwBFMcEDA8BmAEGX+IHFRACBykCBAsBogJxApYDiQFOMA+EAgIDDwEBFdMcAQEkKAJZAQCK3LRSmfehbraahWwuqXE8ewJ6MFTfNTCxZdui6qI505+tU7oqrn3r6kcXS7p44f9gq2GMGsh0xVRi79j3N6JuSNuvslR4PfXMVpWPAffxLo8z7kyre78p4Qf3NNlUiR3dqpNyou+5gF47ou3X+Ctg++vKNvMnSFyn6eOOEyJWkGr8EBDNt6sVzSFlL6gBX8namXPZt+dyHsj8VyrB/QY0GJ0i+h9gpiSQVumMD5ynalC7vzLyPF0Pcl+iwfjFwlR7G1SM5zV4azEq7YJN4T7VPObFg2MG/uo2cTzvfJCQzAF+kxKKPos86NnowjMWerhoT9AhmYh6yrZ7kUK0O+3NRwEAAkEAAQAAAAAAAgAAAA9mbGFncGFjay0wMS5zdmcAAAAPZmxhZ3BhY2stMDIuc3Zn/////wAAAAIAAABAAAEFAAQQBAAEQARQQAQEAAAQAAQQREQBQAAAQAAAAAAQEAABEAAAAUBQUEARQAFAQAVABQAAQBABQFAAQEAAEQAAAAA=";

const chunks = {
  "flagpack-01.svg": new URL("./flagpack-01.svg", import.meta.url).href,
  "flagpack-02.svg": new URL("./flagpack-02.svg", import.meta.url).href
};

register('flagpack', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
