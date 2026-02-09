
import { register } from '../core.js';

const lookup = "AAABi4kZARsYORqFw2izWB1lVng1QyMkGGY4REJVslVZJUQ0UVIlelSXSUWHBlg2DSpQDHgIcgQCDQEDqAMGvgESARIJAgr1HRchpwQZBAQFBx0dAtEhHhE7K+YH2gIICANP9wQMAlkBGwedHeNDHaW/B0LNwB1xzVwMYNMw/SESfk8aN7fN2WfEApNf2vcL4ycuHGsMF4uYR1raR62zOObUN5bw12e5JdvbnrTynB2GBUMsF2l1ia1DKfKtJe3z0cPBEPHOI/4/mxV9GT0PwjKYX9dIotO/FTRSTJFgRL4mbREDoem/ThI09O+97LoKQ2A7pKnzOjSZyCa6CoiwsfBsDb6ZrCBpCXa//mtELkeVf447p7v5VnwvJhE5B+6cII8jyZS0RhMsvjlDu5Ki/mjVi+sDVW1pVzaHfRRS83/LFBbWC9tWrIcYLlAFj98jrLWVVlyUrpSS7fK2cNLDyACEY2CMW06kw3Et/lv/t+QbNTqcveFfZTksq7Qbzp8CHdoAczFIAJhABXIBAAAAAAAAAgAAABFmb3VuZGF0aW9uLTAxLnN2ZwAAABFmb3VuZGF0aW9uLTAyLnN2Z/////8AAAACAAAARwUQBEBRVQABRAAEEAUAFEEEAQABAFAAUUQAAABAAQUEVEVAQQAAEBABAURAAFRAAEAQREBAAAAEAAUAQEEEAUQUBBAABRAFAAAAAA==";

const chunks = {
  "foundation-01.svg": new URL("./foundation-01.svg", import.meta.url).href,
  "foundation-02.svg": new URL("./foundation-02.svg", import.meta.url).href
};

register('foundation', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
