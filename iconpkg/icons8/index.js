
import { register } from '../core.js';

const lookup = "AAABTIkY6hgvGphofj5YGEVzhjZ3ZWVGVFeHQSVXRCGDYzZFFpRGB1gxHAQG2QEmjgJdBRE4Cg4KWQ4KCUpnXOoD0QYRFwFrEgUuAgHyAQwtBQUNEwKaDBoKeQJY6oNtpmWS5kYA8/52pJWya99TB+wPrcQL+KDHh9m357Q7XY3kTfWL2kTzHXH+PkQOxChJd7j1MFb0vVTXf4FSD1CwwIPwHL+CXePXJPc4qMOy/VvG/4O+Ci/vc2EyIS0S59J/Q3eQuAChyZJt+3tpR9o0HleAKXiQ+xusNtM1R5/mJi29XWuqaQMDrBVsRxK3Bmyiuzu3peimCHXRtD7SgPeCLNMlPrRnh5okErWTbBccXc8RsF/7jZL88nMHNO1zpr5HTQDLjr44XRUK/vk5Q+HUzF/kvhv/FTDEz+YyogjQyVnOS7yoGcnqrUYAAEBAQAIAAAAAAgAAAA1pY29uczgtMDEuc3ZnAAAADWljb25zOC0wMi5zdmf/////AAAAAgAAADsAAQEBAAAAABAABAQEAAQEEAAARQAAVAQAAAAAAAAAEABAAAAAFQAAABQAAAABEAFAABAAAAAEEFAEAAAAAAA=";

const chunks = {
  "icons8-01.svg": new URL("./icons8-01.svg", import.meta.url).href,
  "icons8-02.svg": new URL("./icons8-02.svg", import.meta.url).href
};

register('icons8', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
