
import { register } from '../core.js';

const lookup = "AAAA8okYpBghGie+/IdRRIYpR0RllDZUNVQjtEV0RgNYJhMNH5sE0gQBWAkCBScpBu0FgAEEBQcPAhUIAwX1CjMUEx6nAQsBAlikjy274Bi+nua+8af90AdZJL6F7JuMduwh1mvRC5UcJzdtB9TScfL/8vNpSH0cqHNDtg80rX+qGVPklIx7ltNdqXTljssmYgkyFiui1+QxRBJShK+r3uc/2T9xLnVBD6T+TZUIOQPth3QlE4fbPjvFotwdsdqzWml+oGAEituAi5v0v5x88vOVPbriSa2wyyxVa4JEp0qnvNAK5rnlquQkhIqmCpVFAABAAAAAAAAAAQAAABJmYTYtcmVndWxhci0wMS5zdmf/////AAAAAQAAABUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "fa6-regular-01.svg": new URL("./fa6-regular-01.svg", import.meta.url).href
};

register('fa6-regular', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
