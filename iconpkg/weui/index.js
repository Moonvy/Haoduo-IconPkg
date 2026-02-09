
import { register } from '../core.js';

const lookup = "AAAA7IkYohghGvuK6r1Rc5dYeEJnUVKFNDVFGWQzVgJYItMBrwLtA5wCBfUCSQECLZQCCAEgIQ0ZCgsEoRAPDQkCFA0CWKIlS0vm6wGbY85YpVNypT4NEpJhwLtzycrsO4q/0wthbtfbgIEJNOIRqxuvtHdv0UbHi7BA/TPLobK9pTpktKfQRrDp6PRqJBADQ5hTjZI7hnZAf1Za3MwhewHCGxDjmr+hXmwDl1Wden7Rx572dEIzmhRfEmnMsemGjpL3K7vX0UbntvD7g4+EoycqVrp9kgk3/G/J6Q52grGlOKQLTy/vOINFAVAIAgEAAAAAAQAAAAt3ZXVpLTAxLnN2Z/////8AAAABAAAAFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "weui-01.svg": new URL("./weui-01.svg", import.meta.url).href
};

register('weui', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
