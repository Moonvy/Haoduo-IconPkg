
import { register } from '../core.js';

const lookup = "AAABnYkZASkYPBrOtUZGWB5GMmgTc1RkVyaBhiNpM0dmWSFnVicmcoKGM2JrR0ZYOTgIzwI4AwEsDgQDUp8BKlubA1luAawCCgR7DwEwwwEECyoaGqMBARYBDrYCGgUIngGRfTGsAQgYEAJZASk4+qwbKJ3PQqeAHBy3cnB2Xe/HCX++aVSu6TCwXeJo02AVyrk5TficfIdADfOswYK1n/l+s3Vo6bDm5zVKSVthzslDYPGowTMgb2esHYFh64MFfJHIYfCak5A0Tf91VnKmIg2Z+77VmKdqpA3zLVuLxFLecqed0zXFFfJosQO8uqLuGoF6vOgFqxHdmgNQHQ8H+mKZxMC25Z3IaVh7p3ETdaFT+Z3OOSM+WdqVbPpzX4caFMmXTHryrXUl57kTEZsiItnSVIW/7TYUDj1K/wKI7LO+/QE7vnEEKke1wTZakaxwazNAozRG7JZtFyGOGq5VPxGRK5mGxmj3Eh/RNhgn/uiEO3vfjhn903lk5GCB9ESWPfS/uuhVHLlE+BchdTYLuUYNPDgmI41IhgBGBAxQEQAAAAAAAgAAABB6b25kaWNvbnMtMDEuc3ZnAAAAEHpvbmRpY29ucy0wMi5zdmf/////AAAAAgAAAEsRQBEREFEAABVAAABBEUEBARAUEAAQQEQBAAFBRURQAAQEABEFBAQRAAUEBAABABEEAVEBQARAQBAFBAEQARQAUARQQQFUABRQFQEAAAAA";

const chunks = {
  "zondicons-01.svg": new URL("./zondicons-01.svg", import.meta.url).href,
  "zondicons-02.svg": new URL("./zondicons-02.svg", import.meta.url).href
};

register('zondicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
