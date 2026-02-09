
import { register } from '../core.js';

const lookup = "AAABOIkY3xgtGjpC46dXSUh1ZhVmJKNWIxZThkSIXDRyE1VFFQZYKrsCkgMLE1EsKQmPAQkB/AgaGAQOASQq+QYDC7cGoQOeIgoIKwZVQgsLEgJY30y/73QLs60wQybAiqlWG2HipG1gtxmJ4smgz8w0kv9C2jz7mF255Gu5/9fwnayBxHqjqge6dyccjJCVzg1p38B2oYfRlqI7N4xzHQx7sERbv3HWh6c04kaELOsqU+8zeu8n9L2dXLo40v5+utPTwXAXcTYaMTWsIwPQ/WVC0jskjha+Ie91+2DAGtd2P/MKUSpunP7HB7Y8HjifAYUgnzBsMaL7FxEX+gEdJEGr2vG4xExha0TJKmWMR0ewHQ8FSkLIDC2+wQc1XIyFm23DiL9X8jA5NvIRwrWVkwbmQKVGAmIoADUIAAAAAAIAAAAJb2ktMDEuc3ZnAAAACW9pLTAyLnN2Z/////8AAAACAAAAOAAAAAAEAEAFAABAAAAAQAEAAQAUABAAAEABAAAEEQAAAAQQQAAAAAEEAAAAAAAAAAAAAAAAQAAEAAAAAA==";

const chunks = {
  "oi-01.svg": new URL("./oi-01.svg", import.meta.url).href,
  "oi-02.svg": new URL("./oi-02.svg", import.meta.url).href
};

register('oi', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
