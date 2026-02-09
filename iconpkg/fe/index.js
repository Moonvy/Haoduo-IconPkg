
import { register } from '../core.js';

const lookup = "AAABZokY/xgzGnWhV11YGnilRVQ3M1NTdHVUhGR3J2VEdlcmZkQ0NEMFWDOfAWhNmxcbAQImAQUUARsCuwQjUAwWIvcGCC9PSwZFDgYCLo8BigIdjwEKZA0MCxIPA0ACWP8dHfJWDqnXmP55FOvkO0jbbOZTekel0cgXsE5R5ZZhMu9ziCxwLuqHoEpl2dMq5fJpGyFRrG3Vcb6CMPKcJzAyeSzvGPDbfJWOYNq9h4JOgSapB/lpqDPS6IDOv7vxg9eo16RBZr4RAA16yiDJDiOJX+VCYj0pk1Aw6xsc3eO5UxXkOb5tWeanFwy2Vmj6OJgKGN8ai20KrhQmv4P53/qSqthE0Tvah5z0k/vFHhusZ2r+rQJ8QEW/Y60THi8kZiWgur705H7w+T6VAeK8nCvX92/zc6hg3IxwGxYHUuXao2CvxC4w0mhG2tC1lwf9A4v65nxXJ+2mIz/5djWVLftHIBgAIIAgBAAAAAACAAAACWZlLTAxLnN2ZwAAAAlmZS0wMi5zdmf/////AAAAAgAAAEAEAAQFAAABBAABAEAAAEEBQQBEAFAEAFQEEUAAABAQBAEAAAEAQABEEAEAQBAURBAAFAAURAEAAQQAAQEBAAQAAAAAAA==";

const chunks = {
  "fe-01.svg": new URL("./fe-01.svg", import.meta.url).href,
  "fe-02.svg": new URL("./fe-02.svg", import.meta.url).href
};

register('fe', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
