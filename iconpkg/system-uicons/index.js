
import { register } from '../core.js';

const lookup = "AAACVokZAa4YVhpez/pwWCtFR0tkBCaUhXRUSDpldYZDWWZEZVU4JSVjV4YmNFWGdHVVVSMhITVmVnNjWF0UDBQDnkEDB0wSAQejBQzCBQipAQoJ1wIMcgKYARgORWeaAQLPCA4+5wEBCAsDK80DCTQBDAiIATojB9MDDQUBEiUGzAMEMAeDAhVQIwIBAQELA68CDC0KCI0BASICWQGu1xwP6OaV/TCdLAl4uZ4HqxZ+3f4edodjieUkCYOKnIaWa61zYjZ7HeihXwafPnZEHUTaK88HE2+nMRzgpv1xqqzXc+RhvC1ovwc0xLDsROhhTeTtBjFmAuyhnNDJKkywfLk86B+fjBTQqTA8HWSCr1+wPxdclB1/0P6/vr/C8p+OBziB5aAUi1z9hxuy2dj5OfO0ZV+CW1+D+6d4GK+HrNHkuRX1yI+1M6/70Hrgv5qgbbSUk+bOTJRD2baX+EtAQH/iByCN/ti6wvZTukgAkoXqOPdwlBRG3eK5vigLqqkbxw4lrEoDDL3EcpXZtWSS7EXWG4FtBUNUV1uqib5tsTxroMVaB+eipqbvhG1idZB1IZipN3NEuM/8g+NnEx8sQ3Q0hBQNYx5cClIo2TadrdWLamwUEmCNsokXuz7OXd3zzhVFiSDqdexQaNm/o2DyorRWMKWNGIYcFquf4KffpNysRYAwuOs0l4fyfMrHldDmlqaVI76wRJFZn9F69KtplW1xEW4EA6CtHpFWoKy+IyjZDCpnGtKBDXIdxIu1EjsFwIIpJZCGNd12oH85nEsACgCAQICAAAAHAAAAAAADAAAAFHN5c3RlbS11aWNvbnMtMDEuc3ZnAAAAFHN5c3RlbS11aWNvbnMtMDIuc3ZnAAAAFHN5c3RlbS11aWNvbnMtMDMuc3Zn/////wAAAAIAAABsBQVWVQUUBFFCVFgBVUAFBEQYWUQgmAVEFARUQRAQBlEUUVEVFFAQFVhFQIAJBVVJVUEJpSISAIhZQBQUEAFAQhQRUWFFVBgVQVARARBVQIBUVEAERFRAQASFgEQRRUAIARRBYFEURUUFUEUEAAAAAA==";

const chunks = {
  "system-uicons-01.svg": new URL("./system-uicons-01.svg", import.meta.url).href,
  "system-uicons-02.svg": new URL("./system-uicons-02.svg", import.meta.url).href,
  "system-uicons-03.svg": new URL("./system-uicons-03.svg", import.meta.url).href
};

register('system-uicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
