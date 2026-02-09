
import { register } from '../core.js';

const lookup = "AAACT4kZAawYVhrMHeqmWCszQmZxNzg3d1YlGGaVhkR1OEaDRTNCQ4RkdTB2Z0JHeFQnakVkCFhyYnJyWFgCBwUlsgGtBfMCBKUBBMoHAY8BjQEJDxxLWy8FiQskWQIHJsEBGicGBqkBHREHEhEIBJMBBhwW1wEBFcsCsQIJ6QIB7g6HAgkKUH8ZCwMcwQexCHwBDFF4AlkBrL4kiCj0i8hKiS3Z9c7VC1r9S9hItQvkk8FRuXtWGgiBhHQzdSQwFum1Nty/R00QP6bVp8yFP76eG+HdaS07aWXe1IfsA7AYnVRINwACuc5NQsDmdZ1HWUbmtAzH1mAnMqODAnO0jhrNhQtDbPGVHFU+CiEP/EbK3a+fUadaukIGGyt+Jqk9AGCSBTJ6DvLB4SXEMIdjqAew5k/bDgmvz43+K/I0CkiMUL74El8DFr8+sNCYkvN205xp5xE1DdVYzuaMwc4Iz0odjajnaog2rctkT6DdYCN8pcMOLQu9rHbsszQBbAtH2cGEouNShPlAJozYlDbKxYF18Lv0WsxKVixxZwIjVIy83GW3Kh2VmrGghRQPrvZJOosTC97FKq0iyg0zdO/G9xhq0STzNtSMdtCm1+jmgRcoMRgBxBVvvr3u8n/wIAe+xqefRnmb643FdWs1Fc8x35/o1dAVRBSExWzIAhKSfF1kgX5fNOfRaj66+XX7cxDV/tfFoLk4Tq5UmMEhFPXWcosl7YSpUM6IiHThlItbyJh1b22UcTahiqo0YEvWtL+7z4TyEjiVS0QAKBAABhAGSGgUAAAAAAMAAAAPcGVwaWNvbnMtMDEuc3ZnAAAAD3BlcGljb25zLTAyLnN2ZwAAAA9wZXBpY29ucy0wMy5zdmf/////AAAAAgAAAGsVSYFRQWAUFFEQQFGJJBUQQQBEVZQFFRAEQVUEEBBGZFUVABIIGUhRBUUEFCRAFBERkEEAAVQAEUUlFgFVQEJUEEABFEJBAGFUVVIFRBABRWFRYFQVRIEFAUFRBFYEURQAUFZVRJUURRkAFAAAAAA=";

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
