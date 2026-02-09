
import { register } from '../core.js';

const lookup = "AAABkYkZARsYORof0yHQWB1JJjIjdUdEQ2RGiIR0RmEmi1gnN5VIMlVlQzE1CFg8oQ8wIgEuiwEREhcDAwwacx/aAdUCBPABCGIDCzhB4m+sC98BCdIBsAEHCNkJhAcWG4UBPawBAQ0RAsoFAlkBG2C0FNoDjxHsISwPfTR+2hL/BzftnrsNGRtDva2kwwzyGMBDF9e6AMMgN/49GluiZ99DSHaO+RV80gwAG5KxJaLC20915hEdzvPBLQUyv7AKUqFHHC6PAhVoE6w1rXOYbYv3MeOsJgWTQjmGB22/Eu+YHf1lcClEW2uLYLb+mTqnOyVHVj9fUiPyCSxV2yzwNrmcYJS/AtlcCjjElFZcTjkvWs1Q8bu31YlMpdTTRJmIaZG+luk6Jp3ILmxWt84jQyfyFB2kn+5n18lj8K2EOZxprpWMa1/W630XR2m1EF8wcb4j8x2c5Icd877N0XEHJs20lZT+vUb0fy4Dh3+0CzvTQ7+6CyCzNBapYP402ler4cjb7ZLL406brMNIuCAAkCAwGAAAAAAAAgAAABFmb3VuZGF0aW9uLTAxLnN2ZwAAABFmb3VuZGF0aW9uLTAyLnN2Z/////8AAAACAAAARwRFARQABRAAAEBRRAEAFQFEFABEQQABBABBAVARABAQAAFEUBQAABQFABAVQEABEAQBEEAAQAFAURBAEQQEBEBAAABERAABAAAAAA==";

const chunks = {
  "foundation-01.svg": new URL("./foundation-01.svg", import.meta.url).href,
  "foundation-02.svg": new URL("./foundation-02.svg", import.meta.url).href
};

register('foundation', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
