
import { register } from '../core.js';

const lookup = "AAABZokY/RgzGrqp3a1YGkMTZpN4ckNZJXQyJjUoRlQ4RGY1tDdVSYYEWDUDAwOyAToHuQSrA2QDPAIFrQQfAQEFwgEBYwIC7wUJCA9zARMFCikDC/4EGgcPCIYHAroEGwJY/cCzhrleMO1/c4S69XZMGN5W+FZ3rKtDrQVZ9Jqyo6WmCsV7Pi7gxv0B+7Uh9RJVSWJelHeK2/eDi1rgotfC9ux1v7moJisv+17Ovaqh76QcNiqnFd+KsP1Rm6NiF46G5fWdBNpL7UEzVAxO+nen1yTN/Ab/czfwnJ9JnH+5H1ZGOAkTt91tKXnCqpWgAvtwdhcT4U+WDqmPUp9IKFdDN9dUHgA77PQSeyR7XOmOybpQ5M5eixPeNbeoIRqfU+81QCKpmXD6IR/jK9jS5jskkRTY/4Te0YNNJyQuzF+fInda5TKF/pswg7DzPLf8OmxXKGH0slBHZoI9MqTAvKRHCACQKAgAAQAAAAACAAAAEGVvcy1pY29ucy0wMS5zdmcAAAAQZW9zLWljb25zLTAyLnN2Z/////8AAAACAAAAQAAAAQBBAABQEEAAFAFAAFAQAAAAAAAQAAEAAAFAEBAVABBQBBAEAAAEEERAEAEBRAQBAAAAUEABBEAAEBBEBQAAAAAA";

const chunks = {
  "eos-icons-01.svg": new URL("./eos-icons-01.svg", import.meta.url).href,
  "eos-icons-02.svg": new URL("./eos-icons-02.svg", import.meta.url).href
};

register('eos-icons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
