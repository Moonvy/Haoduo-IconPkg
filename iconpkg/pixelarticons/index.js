
import { register } from '../core.js';

const lookup = "AAACo4kZAeYYYhrJrWrtWDFWRCI1JIM3R3inQlNKNRlhNUUrknVngoKzNlZ2Y0RjdGNmRKlUdFRlREg1ZTZUJCNCWGpIGAwHEwEQJ+IGBO4CFfcCkAGNCSwBAZsdCjYB7gZmLAVAF+UBA+gCBeMBdC4C8wICnAQT7CVwAXIX9AHPAQEtDAcGC8ECAQWAAyQBC8ghtCoBTBO4AgIJEQ0NkQQsCgQLH4EBAwsCFgIOAlkB5q1Mq6YdIlpocfOUg7HFNampvgffUR6M9reMUzC/ChWRzNDzjMdTZ1VAyhHXIB0SzYrSFl1USsD/ATPhJeZ5nDCkSbXGn/uSx9mwbAs8MfDHb36/Lvxk+3TOwoIC6ZCvDP1UglW3ltpukHbyyCxgORuiIBfuBJQmjKfdbIdwz0HkbQ71yPboqZWY3JxjzYhPPQXyDFUn7/hEe8WzgfiAe19zLP5O9PmQ0AvLneqnwd7URORByve/gxho0ZDZDUTq02PjaUtpcaYmwRfD+TAxNT5ZF4hXweaTpfkY6Dv+MA834Bw3h2lPXBxwY9XxmGuV3QaCoTdBkR4J5XXYZAmozo40zYtg07BzAHU+/X87ryQBcrNr3vl3avYqyJWVQFo+lMhhPfyQqNme6z/HeEdEJfeGAGA/qcUnzQyo5q2XDIa+FoqJEx8FX+fC3bXP1qqUTNuh5wsn8/n63fYM4ka7czwxKadLFkaT/ZUfZKVLCjEDIDKKWnBKrh26UjO+eh4Kfja5u/PKsrE0w+YIMnNKocudt3WmF5AGnM4syRt2gXtHnNhQFDpsyOyVOW+sg+fu904ffGeTWBEgrGUecv/sjLAgboJSTWkkLWZohRtLsd78Aspt8mowNlB7M5/Dm+ZgsKMlcIe+HU2wAZBgQAAAEAAAAaABAAAAAAMAAAAUcGl4ZWxhcnRpY29ucy0wMS5zdmcAAAAUcGl4ZWxhcnRpY29ucy0wMi5zdmcAAAAUcGl4ZWxhcnRpY29ucy0wMy5zdmf/////AAAAAgAAAHqGEhCKgpUEgAEhQVFYAUFpUZACUVFgWVIBWCFJYlUBUGhlBBAQhBAQRlVgEhQFFBpVhJUpKRRZARFQVggEQFFZAYBVihGJBhWgmkURVUYCoBSESBIEBVIEUBBlUYplIUVAAUhSJJBGQFBUFBIFAWhViRFRhgEWoVgUCQAAAAA=";

const chunks = {
  "pixelarticons-01.svg": new URL("./pixelarticons-01.svg", import.meta.url).href,
  "pixelarticons-02.svg": new URL("./pixelarticons-02.svg", import.meta.url).href,
  "pixelarticons-03.svg": new URL("./pixelarticons-03.svg", import.meta.url).href
};

register('pixelarticons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
