
import { register } from '../core.js';

const lookup = "AAABH4kYxxgoGvxsiydUciU0RER6RTZmUlczdYMzJUaReZdYLbsFOQoCCAULAuoMOgwCHAGBARcBNoMEQAIFJu8DtwIUAgmxAQFG6RLCAgPMAwJYxzvfAeM9gjzFyBju4VTv8VTBt0L39R5o0LZf7ddymSqTkM2i28zJpgs0bm4uPFQne+iyK2FgMHhiEAei6CL+fL+KL2vbPvLKcZW0V7eJcWCDEgGtr7/N4ftcSAYWR3rn7ZofmTtyTTyoqfy2nTP4nI+ruHOh9+FejJ+iepCLzJGP84xUOc14jntUS6oXcl08NdouflLpXyEq7+o2JAZ7qzDZk7l6UFT9uiGxNaLCyu+MTOv3xRt4Pu1lE1MxIurCgA80+vjcN7pFCQAAhAQAAAAAAQAAAApjaWYtMDEuc3Zn/////wAAAAEAAAAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "cif-01.svg": new URL("./cif-01.svg", import.meta.url).href
};

register('cif', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
