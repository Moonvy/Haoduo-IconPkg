
import { register } from '../core.js';

const lookup = "AAACsIkZAfQYZBpzLiNSWDIXc1cGRYUzhGVxRTR2RTNJSkdCU1RoFnhkVlJUJjN1dVN2SDKEO0UoNjtVlKSVFXNVBlhoFwwQGgMCPQEisgQIAQUbBivUAS0DFggulgcBCAQtEIMKCCYDARAEAwEG4QcGUOsDdAYybDERBh8tBwEu4QILzgMDFAylA9kDBQzyA7MBHRICXAKEDgUCPQScAQS8BRL7DCECMwIXowECWQH0mLUNxbHfM3/kYfhKlVCOQbRum1xuHzdjJdXcDWknC7ozHXjG3tkyGxVNS6D6RlSGLAby8BUKj7P23p+XcJX7AAP3KFDUtyOgvtghkZ4XkREl9uLfb/Z/G55a4ZBcqZtQI7X4YU0YGbjGCXagN34SGzbY40cU2abJcHwZp1CeS/PSOiYFxtqzBceoTIg1tjZdh6v3noyJpwNInTd7SQoG5rprn99wMO8fQdUEOXCYAM2kiF9O+uC78JPF/gFz6VoygFuZkioDi01XOUtmTSRSAqQvKWB/k0sk1K2R6MKSxeGTXbqrcjn6w/zi++1nTTSIV7f9RN3v8Bi9+2CLRrm8W+vPnm/zTsIKa2po7x+5qWUP/cs+HnOcRZgcNxBYjBBpwBMby9cknHc2ct6adtEt5l6xk+L4mTNHQa3kf63ZIO/leKmRKxpIaSpJcR/QS4Boyv4A+ii/xkBRnJBLqS/5Ld1GKgRabkkRPjDm/mRN0WyGUSTJUtXFPOjeHwCNRILLXw/aXQwK163qTFf0FAh+dLEuf5zsSO9ZhvY/HI6NnzVokGbgOPBufzqE51aUKuahuViXOVKDZxnQBwoRnGHtnPdblr1lNzFpPYNvw6lVmHNo7stJBi+pYKi9LOF3uwdsOvd3cjo5CvjEjViK6F+lQ/jHwJlNggAEEAAgEALAiAAgCAAAAAADAAAAHXN0cmVhbWxpbmUtY3liZXItY29sb3ItMDEuc3ZnAAAAHXN0cmVhbWxpbmUtY3liZXItY29sb3ItMDIuc3ZnAAAAHXN0cmVhbWxpbmUtY3liZXItY29sb3ItMDMuc3Zn/////wAAAAIAAAB9UAEAFCGgQEhRGVEUUlAUmlhFKhgCVEUlZkRQEUZQKVEIAogWkYEQSYQWQJhEhAEkkBVQUYEEZUQRVqEBBABZiaQUZBoqEURaIFUCoEVWokBYAakRlpgCEGiEmUZaBEVWhBJFWFWglpWFVFaUABWRCFQkRKIgWFEIVEFEARAAAAAA";

const chunks = {
  "streamline-cyber-color-01.svg": new URL("./streamline-cyber-color-01.svg", import.meta.url).href,
  "streamline-cyber-color-02.svg": new URL("./streamline-cyber-color-02.svg", import.meta.url).href,
  "streamline-cyber-color-03.svg": new URL("./streamline-cyber-color-03.svg", import.meta.url).href
};

register('streamline-cyber-color', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
