
import { register } from '../core.js';

const lookup = "AAAAZYkYPw0aTxbXXEdiM4KRg4YETScBAqMBcwaTAx2fCQQCWD/FPScyFWRJjixW8vQjZNF3guIyxO7HO8xoVMvEDbsysXeA5NyLGmV8V9YxVxK/K/mtChVsoLI2B3+Su6HdyURCUQAAAAAAAQAAAAt1bmpzLTAxLnN2Z/////8AAAABAAAACAAAAAAAAAAAAAAAAA==";

const chunks = {
  "unjs-01.svg": new URL("./unjs-01.svg", import.meta.url).href
};

register('unjs', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
