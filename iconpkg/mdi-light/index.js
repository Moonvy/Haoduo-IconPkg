
import { register } from '../core.js';

const lookup = "AAABrokZATAYPRpv5G9mWB9FJ0VVRHR2NpVCdqRXdTVlJmh0JGVTZGkjc3UTKSIHWEIOagIUKAoCIwUFnwIhZF8GAoUOB4ABlgEHgBJ/WjeVARwLUT80KJsBAXMIBA+tAQYBF0GJDHgBAQXLAQgqApADAWUCWQEw1r25s9RrR4h9cnC7v92t4xhabGyNaQU2napzxkd8z14UvCVd1wcAON6X9fDBoTejFOQ/e/7oVg/yusd+JABz1YXkwpzlGMZnFtu9vx3zygnWe45skCA/kEERIH0qYNtfUDeYsJus69JDIl0SN21itCGle0wV1gd4lUltIqzseYEYfW1/6GeVUSgkp9Kt7HVZtISAlYZfMFOJjHTkNCnORqNKYGwq9GkaDQG8G6AqHt3Fr3DFjOjkR/4cM8+LdmfVtg81WMrrta2MELxIfKf18tBXrCFT2soFhL+4IWsbvra+UEfSA/celVowlCoyc9KtYNFkG8HQdicz6E08BA2FTqhbv9eQrowKNXxIC9wu/Wwyih0sJj4AR0Exw+tH0U91TWa93WTQnQTxUB2sU+I7z0gBAAQAAgCABgAAAAACAAAAEG1kaS1saWdodC0wMS5zdmcAAAAQbWRpLWxpZ2h0LTAyLnN2Z/////8AAAACAAAATEQBQUBQRBABBAUAAAQAQEAUBVERFABQBEAARAVFVQEQBARAUABAQRABRBAAFBABABAQQFEAAUFBAABABUAERVVABQAAEVFEEQQEBBUAAAAA";

const chunks = {
  "mdi-light-01.svg": new URL("./mdi-light-01.svg", import.meta.url).href,
  "mdi-light-02.svg": new URL("./mdi-light-02.svg", import.meta.url).href
};

register('mdi-light', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
