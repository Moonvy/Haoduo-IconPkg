
import { register } from '../core.js';

const lookup = "AAAC1YkZAgoYaRpUL1VhWDVZdnVGNiZWdhV4FWSURVloRzFTdDpVRWNDNjZEYqYiRWFih0M2MldhVEOIN2pWRENGNYOkA1hz0AIkGe0BTJsECwMBBCUEEIQBOAu4ApABMQkBE+0CJhHRBgOaA0ISGxQDAwitAu8rBogBBiIXAQ4JBc0BBloEDAg3kQG7KgcEGgLLAVz9AQINFfIBDAofBgyAA9EBggEEuhdlqwEGBycDGAwEGgR3BswdAgJZAgryOu4ZbT6Zz5eoCiG+EdmZvNHJqhgc7ygkb3LU0i9HxnWP7GE8h8szVLCDjtexNqnqt3RWX7jdGaX2aVrlaJbY2UdzPW/siNpyKuDX6gAc4xX87ilknei4mZUIB/xZWGvsHkBCG+QHKKXGwxeIf4P0jbZDI4YejTuT5KOfLUDZBjzCaim+Jvs5o39IATwP5uK2f3DXa+rUDPKi76Ov7kZnrrvMpfVHbAE9XdHrSCczhn/ok3oUpOulxl/GLTIVEQDDbyyPWAh4yQnEv8isZR9shRasNx+ygRdJ/Xd/Qiu/miSYMg68H++jzwgFlUSHs3dSBVsv4ig4iSbqmJyU7bHD20W0TZCGpAfm+gaMfiKls0fLUIjbheP38pLa/Fhw5rt7uHbJ0hR2u6Srx45E5+y1Y1K/a7mpYlDZn1CmbPWY7JRR+LrzCqB6j13n6QSLn//iC2d1HWjqM1u6HT+pvJTBJvHDHfJnXWH6z2U5gmyRgvndReP6YXAd/EloAvbw2ti1W8JbfrBMTIs5n3Zw0eJoU054/PetUxNLDS4RFQ5mHiGKKXvmFTcg4O3mqj5KeH0MDibHA8E7fWBpVEtuNZi04syMr8cTfHklyzKM/6M6qRCuH9czezznvn0TT9XIQjcPUgqm5WfPQeDEnyYETdTzJ0LFaS8m4rZTEv7/mPZum2n4GjiR2JN7v+VOAAgiAAQAADGBZgAAEAAAAAAAAwAAAA9yb2VudGdlbi0wMS5zdmcAAAAPcm9lbnRnZW4tMDIuc3ZnAAAAD3JvZW50Z2VuLTAzLnN2Z/////8AAAACAAAAgwaFRpCVQgGoFVAKGEBBSBGBhWkABFYUlVAVZRASlhgYihZCUgYAESiSgEWQRBSFglUpUVGlhlRRFlhRoZKEGUZRQVARglmEBVqgEElIUQVAqmQEAAmVhkWpghZGJlGEmFVSCgZIlImVAaECKgRYqlVFpgYUkmQRBAQiIQUEAEYZZIIAAAAAAA==";

const chunks = {
  "roentgen-01.svg": new URL("./roentgen-01.svg", import.meta.url).href,
  "roentgen-02.svg": new URL("./roentgen-02.svg", import.meta.url).href,
  "roentgen-03.svg": new URL("./roentgen-03.svg", import.meta.url).href
};

register('roentgen', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
