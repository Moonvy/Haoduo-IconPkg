
import { register } from '../core.js';

const lookup = "AAAAzIkYjRgdGulx5ElPMIMTgzNheFc0U1dGdnQLWBoNjgl6AhB4RjYODAYHA2NAHQEx2gEIhQHXPAJYjUPXsEY09DcPrtrp89KeHz749rMHq5m+oDbWbIxtNl91v7ASgmmV012N5OobyIcJh+ZdgmphfiGbrMSDl1u6tSc5/hJMbHVc/bAmbZxy8WBzxB/PWXvUJvKmMMWbTviuEScd5i8q90pYqxJ8BTSqhHSyrgFOWcU+UN0eoR1WzxzXqayMFMy+zs90J77ELkRzBCAAAAAAAAEAAAAMcXVpbGwtMDEuc3Zn/////wAAAAEAAAASAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "quill-01.svg": new URL("./quill-01.svg", import.meta.url).href
};

register('quill', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
