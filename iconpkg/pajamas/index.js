
import { register } from '../core.js';

const lookup = "AAACQokZAZ4YUxqrTrGwWCphM2cpQlJWSScjVUOXVhcjhUclMoNkRYiEhVp3NjiENBc6GDJnUklzcwZYWiAHrwFthgMDAwEIUAHVAwWUAgQFFxsBnAOPDg4s6QFMqQc2DCIDDwWFBQUZDAPpBJ4CiAIp5gOwBxbSAaABPIsBAgKdAgQBvwLuEhCmAQIUXQIH/SUBJwIECQJZAZ6+v5I5JDDgf7cPHUbbbcvo86z1XDCMhx7jiyrBkcpzDXD2eUfyuYxfu1/tVZXMLdd+Z2brTrAJz+Zximl2+bZ/U15lcx5Uv8BCoc7ipHe/TAZSzqcY1XBoZS2+aUrBMeZS1M+7dnoDib/3VHZQ1CkeXpQGxDeB6DsS19DCfox4G38JZ0B4uGcpl6u1Vhhs16Kluk7Opu7VH0g7FZhSYoBr2tpswqOEDjtUtr2dTI0F107RWLN48pKHk7/GYWDlbHZgyIFn4sNwVF9T3/xBb8gmco8CU/WMWsTrBr5x1wdrOhSH5Rnu9ETX97RRUXUWi/TMl2q5nwpJQL/SInqYbgEgj55Q51RHhNJHvZV311LwG3mpLCX3m0+mxZPyWLdtlzKfQIxt8DhvC8AqwZjqnV09bKPpd4UzrErd/pMWkwlh75oAv443R+xry6RSJRiDgsttzheJKjRWlNKEgkeSWTEipw42ehWYV4uYM+mZRMeHWGGwduVob2D6ixn3eMIsGoNbGdtOGNqmpeLhR+ZbuqJd9Sx+n0Jce2r0Yn5JSxtLhQCI4CAAAQJiIAAAAAAAAwAAAA5wYWphbWFzLTAxLnN2ZwAAAA5wYWphbWFzLTAyLnN2ZwAAAA5wYWphbWFzLTAzLnN2Z/////8AAAACAAAAaBQUEVGIRgAFBQVURCVEFEVAEURFBRBEREYEUABAUhBBRVRRVUEAUUFUBVBZVBBgRAkUQEEBUQUEFRBERRVAFFFBVAFJUARURFVQEQFUABUEFBVEAEFlSUQUUBEQAUZFRgUQBAVRAUABAAAAAA==";

const chunks = {
  "pajamas-01.svg": new URL("./pajamas-01.svg", import.meta.url).href,
  "pajamas-02.svg": new URL("./pajamas-02.svg", import.meta.url).href,
  "pajamas-03.svg": new URL("./pajamas-03.svg", import.meta.url).href
};

register('pajamas', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
