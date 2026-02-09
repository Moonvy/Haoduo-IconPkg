
import { register } from '../core.js';

const lookup = "AAAAqIkYcBcaEvLBckx1ZBNFRlZEqXUzYwJYGAd5AVUEFRCkAQH5ASYGA4kC0ioTQgMBBgJYcHrESlsdw55AjCdXzDk1gNQMJqRF73r4djILZZLl5Pi28viqgQPTyhPwnf2ttTqHMACRR4YG95cH8nY8MV4mREY9SJBDv4MTVJOh/SVs35tSsRbnlScXHXvEpAnfH6enCImI0oRm4uQRPETlwl5Jd2pDIABQAAAAAAEAAAALYnBtbi0wMS5zdmf/////AAAAAQAAAA4AAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "bpmn-01.svg": new URL("./bpmn-01.svg", import.meta.url).href
};

register('bpmn', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
