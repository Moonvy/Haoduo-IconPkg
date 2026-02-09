
import { register } from '../core.js';

const lookup = "AAAC7okZAh8YbRqaZF5KWDdWQFp3k3Z2VkREx0NFd1VHMmRRVUZUYkcUJVMzRUSUJHM2NlV2SEdWRVNVVUhlRZKFgnUkU5IIWHWSAgEG/BZcTOoBA7wHCAQyAyEFAg4BAQ3uQQgZBqkBNhY5gwEQAQIdJAkXJxQBCAMKRwEQAQYgAQUwBAgEkwsFAQJQiwEBDAYtdLsDsgQPMQGhARFZBAYLDxEO/wITFQsYA9wZPM4FAeMCCnwTBAMcAqkKxgYCWQIfegWsunfpj8WNmtDkvpF6VOCeKzHUFNEe4hgcdpyu/j2EnzuJR68ESZizpREWk31M9lBuDbkRJx6SiCEugb4L5vdOVccpEnUt1S/Q+ciw90BK2zjQAuYyOOSV8/LcFd47BFYeFjWpaewUvicvdtoVnWz+UTtNdcBwFlO/umu1l0n82L6OT8Q+tjBeIt+et3y/Sf3cThA2qrtjb1i6uJ2jqv8ukjy/mTTupLodipy09+Xyc2iqQwy0EFd7RxiKbj9b0CNbFVysEqvB5GGnzk/haHfSgPks1+/RBXVpVBvO+lSFkcWmFI73QVB0hE9vPDD2KO7hfA3QeLOzpJ0C450m5KyQ1+MJtW2VU0qJ24h+vqTclDcy12lTeTBKBlxGt/PT8dEqDj1K5v7o/UKU6Kreh3qzXye+YCTmzKAwggUkD2vc+rzqQR2VFNGzrOp5mzwqLw0i5UMG9sjVyKa5cAWI5uY9nNcxWxtGQPl9D7EPlc9Jge3van3s6Wv0/LrFmNcJ0zOi6u1mq9NxbXdZDkUCu6BGCfwHxYfmKu3XWBLukvBqXxKMb2E1D9z8uTTFNVk/0iAaHhEztBz3OMkIEOaYDoDw5aQ0rE4wk6KAn/fLCr+BHVA8akns8YFCPwzbpsubWeGYU4nOvaTm5UTUcQewvwkq/Aa6IjMo85/+qM0qvVY8EtqB3f9odjpooOTsu5OluYzJftpZHIUzNaqAtbM+TgQAQAASgAICgAAEQAAAAAAAAAMAAAAOY29kaWNvbi0wMS5zdmcAAAAOY29kaWNvbi0wMi5zdmcAAAAOY29kaWNvbi0wMy5zdmf/////AAAAAgAAAIhRUkagmhBoUKGVmBgCKJRFpmmBgEYSAgkoiGGWgBhCaYkWlFVlRGAYVYYkaiKUFFVQmQkBBJkJFZqpRFUGhKohlEmASUVCgYmYEUFFRYERgmAFRgIkAWCZBVRpAhVSlSAJhmYVZpFQAFACKVlISlCGaBaGhEQBmAShAalBJAGVIGEJiUQAlCgVAAAAAA==";

const chunks = {
  "codicon-01.svg": new URL("./codicon-01.svg", import.meta.url).href,
  "codicon-02.svg": new URL("./codicon-02.svg", import.meta.url).href,
  "codicon-03.svg": new URL("./codicon-03.svg", import.meta.url).href
};

register('codicon', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
