
import { register } from '../core.js';

const lookup = "AAAA74kYohghGs9x+eFRN4VGN2QFYkh2KDQkY4RldAVYJQwCApUG0gIBBgMCAg4FAhL4BOADAg8CDgIFiQEByQYXSw6fATQCWKKaoa9hy8wn18d+EKEJnj4N21aKSzudNLRpv7+x9qWSWu9y0bp2YeNLOBvsL27OhNeDowN2yhuk94J3Kpe75/uwmJJs6AlGK47px7JTc4Fe/dBvOuZve4tCEBKrFAul8MJqM0a7jYZPQ9ObYw500emAO6XREqclCxEDhrRGOJLJ6/QBg3pAtmQz4iH86VXA3KXJvZrMf0CwfSRTj1hfVrE3AZJFAJgAAAAAAAAAAQAAAAt3ZXVpLTAxLnN2Z/////8AAAABAAAAFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "weui-01.svg": new URL("./weui-01.svg", import.meta.url).href
};

register('weui', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
