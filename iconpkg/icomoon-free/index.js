
import { register } from '../core.js';

const lookup = "AAACo4kZAesYYxrkXBvvWDJRc1h2I3JWZSaGRRN4JXdUJ4cYZoMkOUJpQ4NTc1R0plmyNUYlFlWVNkU2KERUVVZBA1hkSQWwAmFEBmUCAgOlAU0QE35wNO0HDQW1A/wDigEDkwKHAhUCYWySCwUDEg4eIwHGAQEGwQMZBwWqAgJGHwIIXz78EO8kTdoQCAVrCQYDAwxKHvAOKRAEAbwDAQQCBQwJHQ0CAgJZAetRig6PLuxdthUEYa0P3U7ATotBa3GwbXtcqFmu2YkbrVNr5APa3uawiQ6Bc5KOHloJp0C/YW8d/tU6VzXMEFJl94fwKiIwds/kOLOOeyCcpDSwbx54IdqnwuXLjPJJMKK4Lf1BRju1hRkCG4aWp0YswmfH5OYBymH+xVxH3K1Nu/jkkh4RxsDH5WmpIx2M72zx5ybK/uyP2kDsmjEtIUCQ1/DzWpmNlJvzYToyeS31eJjreGeTBWow+l1WXnT3vgsn9O99j7CMEktpG2Cvj0hBP+0JqhY1LNlS1bqi/ZBfpcsFl98+p4klXZlcK1gOu6QKoiV2Sp0LpqP81xwsrKwylc/mndrX47B0KZpGTkJNfWA7WF3Fy30SmEV1aeF1G16ZNpX+RpY4qc2DC6nq96F+mu1dFCOZPrbYC2W2r0KUi1A9MAA7fQ+jiS32gr5GYRZp59by6NAHGDR2UD2tIKn4ycOH8JhX6veUyrr1HK1s4VrCkxRcMidlj/oehfK4JlGUVpykYR3IQg2Xy7Ozf/JdNnDQ1g9yUqDhvkXmh1DO55ocBsFg7vISHZ8dVQcDcaP0IIKnuV1nIYDI8WBQCvnqda9WtJZasjpYu5ucIenOR5x4VEAtO9BggzYSyhWDFjSxHK0BRF/J6fNd9k0BAKIAIkAECQQICgQBAAAAAAMAAAATaWNvbW9vbi1mcmVlLTAxLnN2ZwAAABNpY29tb29uLWZyZWUtMDIuc3ZnAAAAE2ljb21vb24tZnJlZS0wMy5zdmf/////AAAAAgAAAHsBFQRRRARJgVgVUVJVWUlQEkUQEVYAAkQUUZRZWAlghkhhJVVZVAoUUkiFgIQCAYIFZJFWBRVQiQQAGCGiSBQRUARCVJpBJYIkpYVhEoQQVpRBVZQRgYlWiQaEUFgEKUYQVFUiACBBURaVKZAYJGgRgUFAZJoIgkgAUQAAAAAA";

const chunks = {
  "icomoon-free-01.svg": new URL("./icomoon-free-01.svg", import.meta.url).href,
  "icomoon-free-02.svg": new URL("./icomoon-free-02.svg", import.meta.url).href,
  "icomoon-free-03.svg": new URL("./icomoon-free-03.svg", import.meta.url).href
};

register('icomoon-free', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
