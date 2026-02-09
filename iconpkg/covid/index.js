
import { register } from '../core.js';

const lookup = "AAAAzokYjhgdGqBbpmRPJQaFJ0UiVWWGd1O1Y1UCWBsTDQLZAmgBKAFEEQF+JPsCBQ8CDBXtAwM6FRgCWI7rVlWeXLmyCR735pFDatvLxfPUi1RJX9lXYzPqNdvBX5OJno+OAA94oqpKwQoxsZft8jCap5GZvOnY6l7AP8OJtvwwrvIduI7TiX6VeajqOaMoBVf+RCsJJz+LSp0+BotcB5ptgiZ5M3hyYU7eB7BW7ewH1DL7qDFlMeh+P1opJhO6ITku4QdqFi8BOJmaRAoMABAAAAAAAQAAAAxjb3ZpZC0wMS5zdmf/////AAAAAQAAABIAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "covid-01.svg": new URL("./covid-01.svg", import.meta.url).href
};

register('covid', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
