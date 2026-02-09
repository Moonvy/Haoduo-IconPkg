
import { register } from '../core.js';

const lookup = "AAABpIkZASoYPBoB4GBtWB5llVIoM5QymRQ0OHMkN3NUODNXNTQlM6aFdkVmdIdYP0g5HMAVAwflAh9oAaMDoAYIDwvmAweCAhPHAwwBXgVTUAYEEMYCDCUHBQEhAQEHHbpDBZUBVBkGMBYHZji+AgJZASq2BXByfYE+snrT1btBo2Bthunxf0FY9sUBlexNvY94wCx+a0LXC72b8/jSyfYQkbhArFPzZGfwpUJ5jofo9WsN/wM6MEhcm1PJl40ee+aRi2/HgfwJvmpmFEEv+yRj91BsDTjzOYHjmYImERHLoFERcZpprcvGcRaDex5D8A6J6r1/G4t2Hq25GIiG/uQqTjhs72PmtpteFYxblVqH8r3NjqI8rO+d75PczOXOY/OjkQfCpBy3NbkgK/JVlp3XERkc2QTLJCMRKjGdKjstYbZLoB7kRBF+nX0Ic9wUBxuEWZ8lpVhfeGA6n53K14JIPHtWwoOpVshcvqOhWJieM+5VNfeXLr/9zaxgF1SrFVEHxn/fcein1wF5b0rXiYuVh1DnD0eAuOnZXY/pSIAjIgIAAAgAAAAAAAIAAAAKdWltLTAxLnN2ZwAAAAp1aW0tMDIuc3Zn/////wAAAAIAAABLARAREAVAQFEEBAAAAAQQQBAQUAABQEREBAAREEFAEAABFEQABAAFRBQBAEEUAARUAQQFBAREVFBBFEBURAAFAABBRBFEQEERQEQEAAAAAA==";

const chunks = {
  "uim-01.svg": new URL("./uim-01.svg", import.meta.url).href,
  "uim-02.svg": new URL("./uim-02.svg", import.meta.url).href
};

register('uim', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
