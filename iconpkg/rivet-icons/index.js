
import { register } from '../core.js';

const lookup = "AAABKYkY0hgqGr0SNiZVUnRiN2ZVNVZFJGdWR0WUNEa1NRaFWCokAxJ6/gRqCQQMKQMmBwgBBgJWHiJHmgERBQIO/hALCyoKT84UHAIhKH4CWNK+7URiEjQzEM5SAroybdzs3B5pJE5SPFb0dpCVuXPMFeb0DSEfvwH0bNxQMD9D5KPtqGlyrRW+PmfBbNYJQjGEJCQJ/ejZHGAyP4uV84xxci6f7NbxHXW2ZVJ/eid8gnYD18/lNntWCfIV10IsX9H5/YLLKaCr/UfItOLyKWsCvfIFhisG7K2wNvnOfLJZgF1Qwx63J4GJ5ef9gMvPrNB/kQhVAhsUubUCFbkPepaCMq2VAVQdbTH6DXTexpFoV9nIBGintbr8unAHclaSttU5IBlGkQAAAIAAAAAAAAIAAAAScml2ZXQtaWNvbnMtMDEuc3ZnAAAAEnJpdmV0LWljb25zLTAyLnN2Z/////8AAAACAAAANQAAAAAAAAAAAAAAQAQAAAAAAEAAQAAAAABAQAAAAAQAQAAAAAAAAAAAAAEEAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "rivet-icons-01.svg": new URL("./rivet-icons-01.svg", import.meta.url).href,
  "rivet-icons-02.svg": new URL("./rivet-icons-02.svg", import.meta.url).href
};

register('rivet-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
