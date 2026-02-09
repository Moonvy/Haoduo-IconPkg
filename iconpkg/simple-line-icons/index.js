
import { register } from '../core.js';

const lookup = "AAABFYkYwhgnGpuB2MpUVSt5RlM0ZFJUU2I4hTSxc0VkOQRYKAc/1XMB6A+HAjkHAw4EDQUCBTQULIUBAQsCBPUdBp0DGwIFQaoIAQcCWMJW0iAVdQcVR1yMB9GDq225uiX5X1vu5FJ0ruiivwE1K1dg8CXjHE5sBybyw1sRQFt4Y8HWNIyJD9a6opjyWD37Kg9YL723/j9y7C/gWFr+GqCkvKhYDjnzeezOstd8jtujAETRbgVgKXa4OnCLHcSwADZwOxxE2Lm+oZz7NooIVkZ7Sp+9Cb899iwdrJCcuWirfwfPEpGHieshlXqw4+ZlHFX9Roa1ChT+SWmnBmQZW+rZgvPAvyYbUulbld3iARt+yUUACBURAAAAAAABAAAAGHNpbXBsZS1saW5lLWljb25zLTAxLnN2Z/////8AAAABAAAAGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "simple-line-icons-01.svg": new URL("./simple-line-icons-01.svg", import.meta.url).href
};

register('simple-line-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
