
import { register } from '../core.js';

const lookup = "AAABCYkYthglGtS8ZcFTSSg0hERGYkU3VHJEZFODeGZzA1gp0QUPtQYDG+gCAh9IAQFFLwGlAgUGBwPSBggFAjEBBQ9s1AN4KCAEOgMCWLbgBwB7CSbBOPRiMrse5X2X9yM6VX0UX6SLZH43mOx2KBZciSicS0XIpokEZCdTGsVKDSU6ZXsnc1dvH7dsD+F+uxPOsLAaOGN59v9i1dImUxRXlgghJwE3MiHg+B+ta8mOMGYmQNrpRo8slPjQk61FYZpU4HLXHGQWFlT8NLyVbdUOoldL3BmngaC82l0eM5+UxIY/GFE1WLVbkNGY6Wlhy17p5//VNUpJvf+aYqGb1uB9HKXAiUUwAAAAAAAAAAABAAAADGN1aWRhLTAxLnN2Z/////8AAAABAAAAFwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "cuida-01.svg": new URL("./cuida-01.svg", import.meta.url).href
};

register('cuida', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
