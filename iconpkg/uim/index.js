
import { register } from '../core.js';

const lookup = "AAABpokZASoYPBpaZEbkWB5lgmIlEiZGdyZUWGMzpkdTN1Wlw2l3NxV0hyQiU0RYQRWKAZ0GrAEQPQwDCK0BIAEIFYoFBAN7AhLbCX8DBgX/AQwLBS/BQAWKmQHaDpMBAif9AQYiAmdPCQMCAQECDgYCAlkBKhabBXl+cskVzcANCcubZAvXL+bXB3Gjdo4QvmFNYwdcwql7Eex4EXhrJKxz1fO5k48q+0EeO/ADa1wEPE6E6M6BLX/okViMEYvlVcsBX0C2l5m7moYucatWlWPGMKD10oLXQmZ+o58NgUsrVbfzyJh7gokIzB5ewol588tUygHZ6a06vVubfRzjM6XzcZ2dgEj2kX8U5Bsef3tgVmz/cO9QnfK2iEqVzfKs6fG/Ppdn/FCdjepsRFE578kU19/4i0EZh33+WDw1xSq2EUO9JQ4kKpFgU9e95nrHg6fng2Mx2Ru4uRWj7lGt3KWP96COU4Y6HqzGlW9HB1k1sun9oYERbUFCSIccniAY3IsPJlqduJZvYDjv9lj38GkXh9Ndvji9pCyiauQjEZ9IlAsAAQCAAAAAAAAAAgAAAAp1aW0tMDEuc3ZnAAAACnVpbS0wMi5zdmf/////AAAAAgAAAEtBARREARBABRVEUAEQAUAEQFUBAABBAABAQQAABEQBAAURAFEAQABAEEERRUQARAUVEREEQBABUABBBRAUEAURAREAAFAAQBAQQQQAAAAA";

const chunks = {
  "uim-01.svg": new URL("./uim-01.svg", import.meta.url).href,
  "uim-02.svg": new URL("./uim-02.svg", import.meta.url).href
};

register('uim', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
