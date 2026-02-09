
import { register } from '../core.js';

const lookup = "AAACyokZAgoYaRptkrlPWDVEYmJGRSQiiFNYh3alhVdBF1lVZDKmZSB1W5RHY1NiREsVZ1NTZUBlPAJqIkdTNVU3hBZZBVhoAwVsAiUTAi4BDwIBnQMDBRD4Ai1qvQQqsAFn4CEHiQFpHwMvMwEiBAFhAQYt+x8+XgE8IukRBNgJsQEGCSEhCyi5DgNaFQcIJg8UGCvLiAEB2E5eAgGjAgIMIgNJKTsFAcICGqkNDg8CWQIK1+urMyfHucl6Fi3ISWDlZFSu6MGOaPcY+Uxbo+zrw7YPAHgLv+NnIfJ+kAabN0Uz4iHmf5NyUo0X9tdHmQ67DioVxZS/jmtYgWU3/Jao7FvEvAznNmMsCKNp+obmwlhv7xlQZsb8sKII5C5UKdq3EZ+jA/U+jAeJoHDS+kfJH+iYJzsj0qXqJsYGi9U/thl7BDuffxV7Hfso6vYNvj0KXeK0mCR4E7N2tbKVmSblYepTKSJP+B4MgrxSZ7Y6G6RsuGEa/7/9bB3C8Z+VCgccFNrM/i9KbL//cAW41Nef9BHyEMjjdoZZ4KQvFQUm4jkUQMf46o+4fcbuqSYy25ju98RTc6VFbryYYdfLsX/tTPLivrri5OBWHS+LPPPs/KT6lEm7Au9rCNmtj5LsitkfCVCFo6WwHjfL8IITHvzysf8HmtgEdanZaeZSr8PP/Ng6aOdAUaVBRMZlM3/YWkvUXaZYyX8+HdGumSRHqewzAOpNiCAXcO53K5F9eDWFy9oBwY84nBX1bM/RuohvnXy0Q2dyKNmX4y3iW199S+Y8etTgKd179qqvzBPbqjyRgz1tDl2MZ+dCtXlISB/pg0RpuzyHjGijOeUmlGlTdE1bD89wEu/DqaUcbiZfKKwRk36fOGhvRoaHrKa+R2tC0U4yasPHCjJ7ASXzQnZC7Tl1k92Yjc+IYlAfd+azTgQIAEACQBATTBQKBCAAAAAAAAMAAAAPcm9lbnRnZW4tMDEuc3ZnAAAAD3JvZW50Z2VuLTAyLnN2ZwAAAA9yb2VudGdlbi0wMy5zdmf/////AAAAAgAAAIOGUGWJUoBWFaBEWSAVZBokglBkVUQRAVRFIooGBIFKYCFAAYpUYaUYVWiVKABCCQUiBUoEhhYVgBiaASAZQABlhEQAlSVVKoWAURVkJGSaamWRlUaoEQRJFJZopGkgZIYGUERZUAJFGFJIhVYFlBAEUFAiiYVERZCBImoZhSYBABhVAAAAAAA=";

const chunks = {
  "roentgen-01.svg": new URL("./roentgen-01.svg", import.meta.url).href,
  "roentgen-02.svg": new URL("./roentgen-02.svg", import.meta.url).href,
  "roentgen-03.svg": new URL("./roentgen-03.svg", import.meta.url).href
};

register('roentgen', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
