
import { register } from '../core.js';

const lookup = "AAABH4kYyBgoGnU2EItUlXVSQoQmeRVlV3dDFFZFRDhnc0RYLEe6CQSjAwQkARYCNUq8KRkXEZcB2AEERlABDQgHJBEYFgOfAQORAQEHeAEBAljIPbUatnszeEq/wiXNg8QR8Hk02VPb/gbMviIH/uNAlATq7PLHUccBpORfReA+voBfleXthgfnb5QJfWW3UDCKQE7tsjIzrmiFzP9FaN/vsfBIntMKf2GwqFAVGpTfR0OdDCjeOC1LVlOWJcAAuJl+z6n663nhGMSoMlieO7VyTVQXA74dbT579byphzLgFKZbpc8r1tMakRzv3giS7OIQka95bmRzApAq6LZShXH37I9WHUCMbCui5srMDfIA8WrooZbXErrss9tFAIgAAgAAAAAAAQAAACBzdHJlYW1saW5lLXN0aWNraWVzLWNvbG9yLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "streamline-stickies-color-01.svg": new URL("./streamline-stickies-color-01.svg", import.meta.url).href
};

register('streamline-stickies-color', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
