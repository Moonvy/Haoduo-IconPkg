
import { register } from '../core.js';

const lookup = "AAABNYkY2BgsGnThf45WY2dTeDZkNkVZFDJkZDQ4RTGVOktFNVgvAwGnAgYDCT4TBQEDIFwICQeTAQEEAhWlAQs9CwTnAQImAgEZvwlZAsoFBh0HDwECWNhBqFlxywnH9n0KcZER72R+v38x8gMLoWEQY325g2DveS3zQcV+iypAjdfIzJHCh9cg/F9a7/MbSqIVIJVy14Y+UyNznTxgA4eauC6+RLaENc0cL9UOcZkVJo4R8eT/OuYjERGdxtegXE1Vg5+ba+47OtyBmNcqeyTLVL3nVGynbSWpo7mVUK8WcPDzl+67SPaBslj3eHtWrGy4WKzp6pEFBGPNL3lbcI/G49wHDVDTBY4mEZkeQivo6U9/tmAHOHs8i3QdP/KAHjMcVYs4hrr3zrnAtpWArNJGAAAYAAEAAAAAAAIAAAAKdWl0LTAxLnN2ZwAAAAp1aXQtMDIuc3Zn/////wAAAAIAAAA2AAAAAEAAEABAAQEAAAAAQBAAAAAAAAAQAAAAAAABAAAABAAAAABAAAAQAAABAABBAAAAABAAAAAAAA==";

const chunks = {
  "uit-01.svg": new URL("./uit-01.svg", import.meta.url).href,
  "uit-02.svg": new URL("./uit-02.svg", import.meta.url).href
};

register('uit', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
