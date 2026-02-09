
import { register } from '../core.js';

const lookup = "AAABHokYyBgoGk4oxXxUMzNBZlM1Y3ZjVXUoN5UTSIZVp0dYKwMGAQoYENABBQkKBARBvgH8AwITCBm0AtkGTgQSqBwCQ0TvAQFGWIMFEg8CWMjIEiHOGc8Lh9fk2to8/EsITOD/yc8iXbsYvE1GqeQd4/Twzk7L7eYqy1PlblQyC9PjNF2ZB9O7ACHOpRaz90sD6xOV6uOigI9TDk/5fId+1LOsnsQ1Q42yy50alZJ+Os413LmQWjRi3hyZyam9D+lpDaaRQ6vQqzHeO5AUHQsP/2M/HZz70BLclXH5yWjVPF0EnSoWQx6/MK3eztWSHGMwncQwRxvOmIvuS8Su9FwgpAitsm4nOocm+8qOh1RQtxBbnidb5kXv5kUQAISgAAAAAAABAAAACndwZi0wMS5zdmf/////AAAAAQAAABkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "wpf-01.svg": new URL("./wpf-01.svg", import.meta.url).href
};

register('wpf', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
