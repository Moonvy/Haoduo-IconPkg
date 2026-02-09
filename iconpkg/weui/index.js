
import { register } from '../core.js';

const lookup = "AAAA7IkYohghGgeQF2dRRkNHMnVXU3RVo0ZidDhIUwNYIhIHAwFsBAEN8gGaAg0TAzIIBwW/CRYKOgWYAcIB/wINEQQCWKI4vxLpyTOaoToQWPyw50+/ECUJEaRaA2pkCxRW6ZLQOMyYmku60S+EVfbvKnt34qd095KAwI83sa9WsJfHG0aBX4bM3EBjDX7KRl4zRsKNc9F60fRhdn3j5kuDASE7uyTw6MnOpXa2o+zr/csbb56OYaXb+0KbkqWxf4vXAT4SJ7THb6Fu6Z0OQL1sNIpytLIDC9eGU9OrKwlDgjuSu4NTpWlFgBBAKAAAAAAAAQAAAAt3ZXVpLTAxLnN2Z/////8AAAABAAAAFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "weui-01.svg": new URL("./weui-01.svg", import.meta.url).href
};

register('weui', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
