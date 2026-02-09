
import { register } from '../core.js';

const lookup = "AAAAQIkYIgcasMIQfUQ5NSsBSZ4BAw8D2JYBAwJYIo2dNzzlLCISoRv/0spA+TIUxhfvqpeE/RsEuDYScb5cXS1BQAAAAAABAAAAEGZvbnRlbGljby0wMS5zdmf/////AAAAAQAAAAUAAAAAAAAAAAA=";

const chunks = {
  "fontelico-01.svg": new URL("./fontelico-01.svg", import.meta.url).href
};

register('fontelico', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
