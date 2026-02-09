
import { register } from '../core.js';

const lookup = "AAACbYkZAcIYWhq9wuvvWC1UFnNUU1R8SZVEKDM3JTNFVXYXVERYRiVlVDVlVic8UyiFljNXV1cHRAVWOGhYXQhHWQIXDhgFBQo2yh4wqAUDRKAFCKICCJIBAwgGCCAOHgYcbwUdBPcFDHcIAwEBUgQJEg4OFpwCEyP/JwECA54DArICMuwVBbYBNs0BQ9YCDS0BGiVIA30DhgLEAQJZAcJeSnmhtTj0KbLLY8uP2Z+Oac90UBULuPwr8Y1tHqGS7ParCKn8UXqb6Dy/nCyZTe9/yf9DENf1ZPXSGih8QLT42L1ffX4UUAsndqwmizV1ZOCrqTn+MTqkS/j6tOzgkb8MHmFxoowkKjxQsER+iBv8FdJehMxQbgOmVjccThXfUS23waAQfgKEU+6u6bmS7pygxatM1QVUjwHsCNyAJ5ZDvXpQ/VuC8iA79SR4Noem6dT6WZkof4kTjGyJKd6VKAyRabYwbOVnpyLhQLxqireeO1YoXc44RhWbLwi0PTgfq3CHO/Yr4la6o8roqKqIrNtPtbjAKrchLg7vtLf48FfB0kdkvaIgGcrQnmluPYt/AdYGvjCzn2fFUsAJLAdMuCl99BZHOBZ91r/7FiyHHfUISdz9tzsUAW5ErA4NNeknsQqyFl9AJDAvrGq+kTPrACay2X6oX92i/4xxaFtZF+yk0iMWvvw4LFtcqWQMnJwE7bANjdpZ1b9Reg4GoA5iaTS1bp5UkAKU9fSLEJrIE9h3PrAUTORjm/+DvXkHJIsIE/To924HNe/cZUcahO3IDqlyMQoVN8qs5mGd0pen105eYQhMCABoKCABAAiCgAgAAAAAAAMAAAAQbWV0ZW9jb25zLTAxLnN2ZwAAABBtZXRlb2NvbnMtMDIuc3ZnAAAAEG1ldGVvY29ucy0wMy5zdmf/////AAAAAgAAAHFEAFFJFJEQABklEGBAEhUSBBFZRQAQEQRIZAFFVBWKBkWBlEZRJQFYWAWFFQBAQFUAUVRZBBhQlURYRCRUkCRBRQAShQEUVBQgRhIERACBkFQQgAYREUFIJFRUCWBFIpRARFVQBEFWZlVFRBJRZZUUBQAAAAA=";

const chunks = {
  "meteocons-01.svg": new URL("./meteocons-01.svg", import.meta.url).href,
  "meteocons-02.svg": new URL("./meteocons-02.svg", import.meta.url).href,
  "meteocons-03.svg": new URL("./meteocons-03.svg", import.meta.url).href
};

register('meteocons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
