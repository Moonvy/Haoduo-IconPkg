declare module "svgicons2svgfont" {
  import { Transform } from "stream";

  interface Options {
    fontName: string;
    normalize?: boolean;
    fontHeight?: number;
    descent?: number;
    log?: () => void;
    [key: string]: any;
  }

  class SVGIcons2SVGFont extends Transform {
    constructor(options: Options);
  }

  export = SVGIcons2SVGFont;
}

declare module "svg2ttf" {
  interface Result {
    data: Uint8Array;
    buffer: ArrayBuffer;
    text: string;
  }

  function svg2ttf(svgFontString: string, options?: any): Result;
  export = svg2ttf;
}

declare module "wawoff2" {
  const wawoff2: {
    compress(buffer: Uint8Array | any): Promise<Uint8Array>;
    decompress(buffer: Uint8Array | any): Promise<Uint8Array>;
  };
  export = wawoff2;
}
