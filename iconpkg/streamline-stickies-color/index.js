
import { register } from '../core.js';

const lookup = "AAABHIkYyBgoGtm4JeNUZTdyVnhCMkVpV1JFM0ZUVmc2dHVYKU8QzAJfqgFy4wIECQgOtRA0jwGGAQEUIAUBDwkNDQy+AWoJBwHhARcPAljIvGjMnv/qj+YXtt/eX9tAHey1Mn557LoBIhqDiudo4LAVTq9fCgjyUpTxonEylJEDqStWbJYcqMy+hlvT7zLv7PJF8DvA7eUzB9OSQGrPAB2M41bgkaVTe9muwkDEclTiQ7Lw1gC+GrZTty1zfW4o11h5lEdQ354HqaFFMFGHAnudJSrhOIUNzfphPmX1zAwUlRGz6Eq/qD7+K8f+98dNec9QNJZvGAbrkL4Qhd617cRkJX/b6ASxpuTKSD0zGqR4Em0JuEuZ7IBFmBiAEAAAAAAAAQAAACBzdHJlYW1saW5lLXN0aWNraWVzLWNvbG9yLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "streamline-stickies-color-01.svg": new URL("./streamline-stickies-color-01.svg", import.meta.url).href
};

register('streamline-stickies-color', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
