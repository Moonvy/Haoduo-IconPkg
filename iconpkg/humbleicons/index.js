
import { register } from '../core.js';

const lookup = "AAABmIkZAR8YOhrKvjqbWB02VSU3ZEaEZTRlR1KCR0NmR3lVQ1VYRiQmdmYkRlg/qgEFCgsBOQMKAxUFC7oFLTkFAhCLASICKQPFAREDBAoUD+ABCIYIKxA9AQw7Cf0GDg8BhQEBArEBFScMAQECAlkBH4yBeu2wCiY+JOt4Bq7sRhczA8qDMYm2uYUYZRiwAaxbFyvFv76Aiz5bFsJpvsDP/XO/86wB9H0JBjn0lktIGG1ucyqCePmghd9YRcfVh26kLORVt4FHIqn+jFqQMJEYxdezssEhdZ+VGxwR1m1rF92KGFMHYK/OIgEewWzVxUJpsJXG2vLm7VcSM35y8xp14smYfn7RUnbIj9jRZDyp/XzY57Wj97rDkUHN/QMPcxt3BfxRTt7uPJHx8jHECV//Kg+rfjtsTIxdYDs+rDv3UYcu4gLJlZ9ROlM2rhQXbkRnrayzEFFKELqIlyy5vlXvP8h7qUbKRxVq0e+pFOYsAKcRBeAWPDxQ2TPGtwqC+x4XMgbbrJKOnaZRtDCYSGzmSBAAQAAASAAAAAAAAAIAAAASaHVtYmxlaWNvbnMtMDEuc3ZnAAAAEmh1bWJsZWljb25zLTAyLnN2Z/////8AAAACAAAASABQAEBFFQEFAABRAEFQEBQAAAEQAEAQUBAFARRFBAABAAAAQFAEQEFQAAFEQRRAAEEEQABUAABUEAUREBAQEAAQQRAEAVEFBAAAAAA=";

const chunks = {
  "humbleicons-01.svg": new URL("./humbleicons-01.svg", import.meta.url).href,
  "humbleicons-02.svg": new URL("./humbleicons-02.svg", import.meta.url).href
};

register('humbleicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
