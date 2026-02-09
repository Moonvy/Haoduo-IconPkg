
import { register } from '../core.js';

const lookup = "AAACeokZAcwYXBqlUzORWC5ZRGVzUoU1NHJESBZlJ6VDVVVDd2REZqKXJ0ZEaBdxY2JlFCQSaVamVVSKZCRWWF+KBxwMHT8CDhFG2QJ+BAsJOwEK3wMWExY2qQIkrwsFAwkdGQwDEDE+BFcDLCegI5UBggibAQMbDwYDnwTAAvQD/AEnASUeLQIaAr0SBTkWOo8TDgEJ5C/MAggCAYkBPgJZAcwbMVxI0UXNobKh/fcQbPtGkMNvIrWfn5TzTyFaZuahH8NpXDqOyd9N2E5Wrg89ar6kUamnk4DnkZRtZ5nc+WH9jusOIkHCKFzCbaESrRjCuuKIzraiE/a1pNmcztDnP/ftgUZfUWcqc+4LAgP97qYq7f7X3VExdzyB73/Y2CNb5kdLh+3KRPJIwryjBTl1MYYqnYt+djzypcaReCesqWW10LKyXQFGEBesYBIVQ0BfPCquouhxGa02u3qwe/kf0RJAg8+bvONm6wSWIYmwUMbKH5eOMEGsWKSxeO2ratir6XU8NJYvg5zria72RKNAyctAhEWPmK2IxVBvm8v80Ku3WCr0G97yzlN2YLHRUnKUccqIl5RRXonB4hKd6bsBEFN3FewJ+EJ52x3QDrdHxpivOriRZQ80zTg+XK2vE6fxiGW9YZv25zwh13ALslOPsgjuuY2dV0htcgbfFXbLZB6PfnnaKpuYDOKjJqPQVzq2etRByBJ8pF27t9NXbzxv5LWIMvJ0W7Mb48IE62VCVUHogyJBSYytEVEe5oflgnNaUYn0xxEoJPDDzO4waSNsLrS2Ns+MQgDO1jlIhmAQfx+StvaAl8PBJbK5PW2DTAgBgQgASABYoAIEAgAAAAADAAAAEGZhLWJyYW5kcy0wMS5zdmcAAAAQZmEtYnJhbmRzLTAyLnN2ZwAAABBmYS1icmFuZHMtMDMuc3Zn/////wAAAAIAAABzRIFEGQZYhQURZKBBEgWgSBEEUkIVUZYFREkZAEkYEUAAWUZIQQAYUWUZBUlVKFAJQlEQQVVJRUFBUVBUiQRAFEEYVlREZJkEUBQkBCERlREUWUBAkSQhmAQBkRVFZVQGVABRQEpphWEUQCVUgAUAgFUAAAAAAAA=";

const chunks = {
  "fa-brands-01.svg": new URL("./fa-brands-01.svg", import.meta.url).href,
  "fa-brands-02.svg": new URL("./fa-brands-02.svg", import.meta.url).href,
  "fa-brands-03.svg": new URL("./fa-brands-03.svg", import.meta.url).href
};

register('fa-brands', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
