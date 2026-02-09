
import { register } from '../core.js';

const lookup = "AAACF4kZAYEYTRoa6DwgWCdlU3SmdSY2FzhWZFVmRTRFJWl1N1ekQWkzM2VmESaDV7ZHVRNlYgRYUBZTMQeOAx+CAR4EjwFNC0K4CQE0MgIGJgMgPAETAQgIAg+8Aio7CKQBAp0BJQXaFQbBA1kIBQMHNzNpJxGHEI4BCi7XD7QDDQMkFYwBAhEKAlkBgXLtIB8zL9bMbNDyOw+KLKVYPu2POz32px62MRiNdYi2dPuVo5MOo+GPUOvyHv26z0DlldFSKrCMhcSpEWXDv2HT42ygIRlYUVTmpFFASXL+WzgFBczq4rImCrSV1nsOAuShgTCbxQ3sdm2FYGtJ/l9rOw0zKgG6iyLm9HNEVWxzFWQynoX5B2jbY9E6SPeWs1CcHDbmv9M5mRaokow5D+uSLK1qnWjLaVlcuhdiaam1lT3oq0VJZSHzX4IiP6AwXFK2kpAyl0J+u9fBUcFCbOSwp7GvT76v/iUf8smvrMR1hhasgtaOL+yOF4FVMI6ciGSsHHdBndJpXpfPvdXwjy/PwxnMGReBSgcJuQzkP75dvcXrqbmfS2AQYHLlQZXyTrG/kIfZZhAJVRQXqRaC7x7IfNtGG3pnFRwJAweWwabOlOI+eo678v2LmFEQvwPmvl4CwqwWypgFqZ/uvrMEog/blRxyrGxCBX96kC2PLhJWyUp9R1WDxf2twW39f/u3j+pKBIgAAAIQAgvAAAAAAAACAAAAGGhlcm9pY29ucy1vdXRsaW5lLTAxLnN2ZwAAABhoZXJvaWNvbnMtb3V0bGluZS0wMi5zdmf/////AAAAAgAAAGEAFUBRFUVAVURFARBFEAUQVFAFERVAUEFEQFQRUQEURUUBQUAUVUBEEQUAVAVQAFABVQVFRRQRRABABFVFUEAEAAAFEUQVEEVEQURAEBFFEBUQRRFFQFVBEQREAEQEQFEAAAAAAA==";

const chunks = {
  "heroicons-outline-01.svg": new URL("./heroicons-outline-01.svg", import.meta.url).href,
  "heroicons-outline-02.svg": new URL("./heroicons-outline-02.svg", import.meta.url).href
};

register('heroicons-outline', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
