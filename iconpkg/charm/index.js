
import { register } from '../core.js';

const lookup = "AAABc4kZAQYYNRpAfAnCWBtmZmZmRWgyUyRGUSY1iGRlNxMsVkc0YkhzKAZYNhsQDzU2I1sSB7QEeQwJEioNKCkCCAIJygMBNgcbAwEJw88DBZ0BPqYDDgQEQuYCAgtkkwGVAQJZAQbeD2n55nW0StYi1Whgo+7jJhbyaE6lByFJcik25AHfpLpVpSxdLCJIBpgkP1VfrSeMfpU4vxR1hR3kD3t/TC3Ava/30W6rETst80epIqy31bNuTqmgfSYsMhx6O8uyHx0eSIOzG+uwvoUctpAMYA2hkpecv71RP/N2120Vnz7tcxZw/ntpu6lsVVOpIaIRUAIkRypAMNA+5ZS+ep0wld5ruac4HaM1ILUMbME8SlCYF1OjMDmoB3etf1YPMhUc1Y/i9xp1ClfqAnSAwtybdgp6w6aB1uNrYNKd0boSDKNxTMrx7fYsify/z01svsqWPnsqr7PrC69GuOzkuyXQwf2WGWcD5YW/RwgwEgAIEAgAAAAAAgAAAAxjaGFybS0wMS5zdmcAAAAMY2hhcm0tMDIuc3Zn/////wAAAAIAAABCAAAERQAUABFBQQAABEAAEEEEAABAFABEVABBUABBAAEAEBAAUABAAABBQAAARQEBRQAQAAUQAQAAEAAAEAEEUAUAAAAAAA==";

const chunks = {
  "charm-01.svg": new URL("./charm-01.svg", import.meta.url).href,
  "charm-02.svg": new URL("./charm-02.svg", import.meta.url).href
};

register('charm', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
