
import { register } from '../core.js';

const lookup = "AAACTIkZAawYVhpLckzfWCtmUkZ0l4ZFhkIlwVRlWjeXhkNEIjY1QjJHR0JIQmJmRGRmZCdJRIZ0YmQmWFUSAzNWBXHDApECCTcBEm3gBAIRAoS+AQIxER3LCBksDBOOF0LgASEQBjAmAQKBBQNWCgelBAECAgN3FDkRCAQSZBQBOQ6EBwIDAxulAgujAY0CBwFQAlkBrGsCdMHEvuZa+TQ2P4i5WAfh4V8xzsESAgudatm7rNy9SFILjUSTknWEdYhCVGp2fAIzWyH+dY3WWpRUc9sQKAANGOtzbyuzp6bPMFB1Koyxi3boO2o41k4+hfDnlaAtZSGKpi39ZWynxk+H1NeEvz1jDNV+jGwW0RQTYCXZ5oj05s0Y7M+pCxTRX7WYyIGbb9gLe4W0FfAkxb0Rr3WdcgNIjDQt9g3daXzBi9aVeYc+TSQAo+7v0EfD50oUPt68xc5gjUf5xn6EgVErNJVDBZ+q8jIPSx0ixTWOhIywD88bdAbdCgjBtD/YiRsguRB0zsocbJjT9afy57SLpSaexBK7VEnINmA2ByS6hcFgFoRZ3sojSKLm5kLpysjkrfIo4RehFbD0oNXzEgMKcUoBCPy6t3W/HbVPNt3FM/NpgffHZw7Qi9WSmpSMRn9xrybQzssOkhrUvty+Nsz+zzjFMDU6rrDAGM4l+xWpmBryiDScgbmUUWTsAm1QvvVW4/EsMgH4Kp83QGnVqOgxzAtkJ+0JS0d6ViMOTV2gVYS+36itRgvV11pGdq5Kv5+DS0QAEQDEOhAAgAAhAAAAAAMAAAAPcGVwaWNvbnMtMDEuc3ZnAAAAD3BlcGljb25zLTAyLnN2ZwAAAA9wZXBpY29ucy0wMy5zdmf/////AAAAAgAAAGtBFlZVBEEQEEFGBFUVFQVARFZBRhAFYEEFUUFYZRBAVgUEQlCEJZQFFUVhCBRFUABQVBBEAGIRUAVFVRURAFVBQFAQFUGRlBAEEFABUSJRFERQAVAAQAgFREVkVVQEYREEQACVEWRAJkRBQQAAAAA=";

const chunks = {
  "pepicons-01.svg": new URL("./pepicons-01.svg", import.meta.url).href,
  "pepicons-02.svg": new URL("./pepicons-02.svg", import.meta.url).href,
  "pepicons-03.svg": new URL("./pepicons-03.svg", import.meta.url).href
};

register('pepicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
