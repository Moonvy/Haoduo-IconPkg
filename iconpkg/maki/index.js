
import { register } from '../core.js';

const lookup = "AAACRokZAaIYVBqaUwe/WCoUZFZEeSZGNlRIJzmTFlMlYWUVVlZYVDRiQUeWRoNDFmpTZTVld3c2dHdYWhcEUUMDAgGXC/MDqgItBgcDFSPkBBDOA/QLBQKFCwQEFjK6ARUCHg4SIyXyAQMXKAwCAbEBCRsETJUNdCN4AQNqrgwlAzEjlQETH3G2ApADhQHwAkcDJjJvEgJZAaJ1royzJ02LPLT9ZXdc/2xmmCN8i8BAJh44N6FFenyNNVyFYbCgRxA+22XF0EW7i8r8Buc1YCDmd171GwHOsT+FVO/yDhAPw8j0J61LgM3pAoaPmvQul+rouqFnTL4/pJb9o/gzOq+d7WLE8mkXbYZwHB2UW5B8FpByJDra8yyH7Bw5Yr2byG//VPVm8m7K++jdtxJHsPvbRqYt9J/rkbhUMSGvSD6bvXX5jym9rCcKc45jUDgXxvJLnwocx7p9v6oHpKMt1kA3iwn/9WRS3Ivc8PtiU3AjE30sb/dYBuTllu0LVQ53hG32VsU2CR9avnMl+hIkz0vG2RwE2TKccHLck+Z1DYe9xeg8+gz4GRIxYfiTrVJESRFkXKa47BzA1gp9kpKdQJljMfV5BaQUSk9sWQbdOtgQN0Jy4MrHVrSZ3/YyDNt8hLx8h56v4AdyYFtY+WdAxMvGkwJLYauQUnjl7FLKKMEsiwEbbwv3p36OniPWKVlr74cK5kEjhHunBtPkr/7Ej0kpAnjPusaar9mvevjr3aq2EZJ2v/3F+bl32wh4SwIIIIghAASEgAAAAAAAAAMAAAALbWFraS0wMS5zdmcAAAALbWFraS0wMi5zdmcAAAALbWFraS0wMy5zdmf/////AAAAAgAAAGlFVVAUUFYQAVRlEBFSBRAZQAVBAVBVVVBEBFUYBFAhEERERAQEUkQRUQQRVREAQQUQRUFZAUUGRFUBQFEQRUEVERRQEVEVURQVGYAQFUFYFhRBUAVUBFZQUgEIGRAAREEREQEEECABAAUAAAAA";

const chunks = {
  "maki-01.svg": new URL("./maki-01.svg", import.meta.url).href,
  "maki-02.svg": new URL("./maki-02.svg", import.meta.url).href,
  "maki-03.svg": new URL("./maki-03.svg", import.meta.url).href
};

register('maki', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
