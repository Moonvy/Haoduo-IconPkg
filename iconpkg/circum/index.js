
import { register } from '../core.js';

const lookup = "AAABkokZASAYOhrWyZ69WB1Do0QjVINZSCNWNFSFOEQ1M2NUVWZlaXlyVUQodVg4HgHhEg0FBANfiQYFSwIFAQIdigzIDg0DAgEDAgEPIRYDEhEWTQwYRVaDFaACnwEJFgcb0wECDTQCWQEgOxdmO1NZuiOGE1M+W7/J0Sxtfw6NSSdU44JCvnV+6MBK2OOOFWmGzMJmcxTTkS0e2OaHUY++fC4MqZ4wwTq7zngH19ZCt5UbxlNFgKX84sztNPqJFpJNrrPlehhUSZhzFCWfcFKzB9HH8hFI7R6UYr9o4svXW1vMaWZqF9+RKLszHVeULNODEtdz8uEX76b/4kPm8p0QBrBq0VvJn5/PgxucnbBOqQVj0ZWtlnEZRCpElLDPVaYdeWqiwq3ZviHgt3k2ngDz3oLtLJMbe0E6P1Wgu1e/DgpgQFkAdUd6HYcDzz/LcHuU0x3WZRePgtRJ45/3kMw5vpwzluYvWEnwVN6sdO/OrjCooBiiFKuF2srZkMCoHtPtSNa9AfTMrzKcSMECcwAAAAEAAAAAAAIAAAANY2lyY3VtLTAxLnN2ZwAAAA1jaXJjdW0tMDIuc3Zn/////wAAAAIAAABIUAAEFBBAQAAQQAAEUAAERBREUEUUQAABAAEUQEAUAAVBAUUBQUEQAAQEEBAAVBEABEQAAAABREAAQQAEBQERAFABAUBAUUVQAAAAAA==";

const chunks = {
  "circum-01.svg": new URL("./circum-01.svg", import.meta.url).href,
  "circum-02.svg": new URL("./circum-02.svg", import.meta.url).href
};

register('circum', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
