
import { register } from '../core.js';

const lookup = "AAABHIkYyBgoGhDS/kRUJBVzkSOFUhZaY4JFU3eEU3ZWeThYKR8BbaEBhw0JPYUCAjNqvB49AgVwShEEB2wkBQQGDPQBvQIM2SF32QEBAljIsr9uAc877N4zaACezOV5TdMScqTfPhDt1sA48lKh7JnMRdum9wpbHX54r6Uizd6FS5ZAVo+2SEXj9RfZwrD+4jKiPuGUqcrskQKH7OAANHm6A74aJe+paBH+UZ3XtbWevujg5LiQlO8zU3PPK5EY+lAozH8Ve0fmtm9lbCuWBxpOBwyGCYMd08cw/y3ySpJQcTLrjG1Dt/EyqL7nKpUNQBx5PVRA6MTt6hRqlCVTX9+ugPBkxLHbBntfVoW8GrMEffDHqGGKCFhFWIIQAAgAAAAAAQAAACBzdHJlYW1saW5lLXN0aWNraWVzLWNvbG9yLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "streamline-stickies-color-01.svg": new URL("./streamline-stickies-color-01.svg", import.meta.url).href
};

register('streamline-stickies-color', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
