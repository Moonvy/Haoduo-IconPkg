
import { register } from '../core.js';

const lookup = "AAABBYkYtBgkGliB2jlSJXh2JFRoeVR2YkcyWiZEIlVFWCgiASR/O70CBwEKGvgDBagLhQEHHjIcAlBGFQINuVkBJwIBCAIVCgIGAli02XusMFbh7WwdHufDJGC+vnw7t9MHXbUUItzmYHsesCnmvp/z+BUuCtBbUcpzLQ5pPEawz/L+OKeULLreztaSYrCXV7o2k4fFEKxzFpesgYoXPzKp7xsevfdtGwHPX0o/kCnhjM6mUJbQrYDpzpkCJTQF9wP9Fc9YoyyVntdSNpWua7+iGPLX9IxG+ZIkHdqddhcC0uRpxfhbf7VTEX5gM5+fCa2dycV1/ZUYmGha/1Op3MS8RQAAAAgAAAAAAAEAAAARbW9uby1pY29ucy0wMS5zdmf/////AAAAAQAAABcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "mono-icons-01.svg": new URL("./mono-icons-01.svg", import.meta.url).href
};

register('mono-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
