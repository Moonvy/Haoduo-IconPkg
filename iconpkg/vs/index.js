
import { register } from '../core.js';

const lookup = "AAAA6okYnxggGiR7C8xQO4N0dXN3clY3I0QmYiNJN1glzioBrwsEsAENPgSwAdkC6wEC7wIsHtABBQII4wEDJwOwEA87AQJYn3RjVijZbZIdF0fxQXyTOI1UEaRB4rRRguTzoa8Y/KntENEKdJX32jvQ/kFCU7QBlCePamPDdz/CH2pj5nz8FY0aFUQyHUIlngE8dF9QvH80KZwFar1mMtnWTk0XmraSN3qUyC2twFzjaRym9fg3f+AnAdvPWy3YkIKpCPj9Fd9o9P7yKSzk77zyoCi0pjH2oqaSxudSMn4I0hj/vGj850QEABIFAAAAAAEAAAAJdnMtMDEuc3Zn/////wAAAAEAAAAUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "vs-01.svg": new URL("./vs-01.svg", import.meta.url).href
};

register('vs', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
