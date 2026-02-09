
import { register } from '../core.js';

const lookup = "AAABBYkYtBgkGmdA/zZSNjVVRlV4M2Kod2OEUydDR0JGWCgWCBE2+QEDHxDLBYEEBAYBEv4DxBbQBF0BGgWCAgc6AgeRAQYCAkofAli0A74U5kpbbCwCsL5rkPes6XP3P5/yxVrzP8OplzSVdRXcra6dHtnhNoe3ks9SYDOikpm18nuY0J6KqRgeHkbOYsXvWGi6fp+tGOY4Xxawzjslf/0brBEijFudlP6/3oDPgZ9pLfm9xB219GAk52BzvOS+LKNGyQKXCuHOUAUdkw66MqfF+KZTFf3X1ynaVjz4lXvTrCRtKV0QF3ZRU+02F2kBBxt81ozK0M+W0rDclTAJVy7/RQYAAAkAAAAAAAEAAAAJbWktMDEuc3Zn/////wAAAAEAAAAXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "mi-01.svg": new URL("./mi-01.svg", import.meta.url).href
};

register('mi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
