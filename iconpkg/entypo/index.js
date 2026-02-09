
import { register } from '../core.js';

const lookup = "AAABzIkZAUEYQRpwgxsUWCE2RXiGJaNlNDc1RFdHY1SWNXNEcjJ1QHJZYnKJRwRUGgZYTA8CNwg9K9QBFSmtLwgjAwOEAwYBAgsnrAGYAYQBDQkCAQIewQcCAQIZAwgD2gECAQvIBQMBqQLeGhMBlwED1gLJCo4BYBEcBh32IEICWQFBYBlf/jUmHgaHG2BuoqsdhadTgue3/x5+PWys1lEsOzesKXmp/ehC2Gu+0Gedh2gGU9tQfktBMOV1vByU5h2ZHBiM/fSefzbdYFK+R5fOEvNLBz2ataPHCw3iq+zSRDU/0q3P+M7XLdlnh/7dAb+MhPeSqx3uc3CwFoE/0hvkbf4xEfX0hVqVdqNVIdNx4wasegPunIMcDhtblTSjYnaGsNN25lujdasy6bGz//AtHs+cHIG5bdqq0fSglO3yzORRBzkcx+7M9J8d3w8JMdHlYs8RrcyjgIz5YCKQ17p7WNChBid8xUHvAeWjFPvBcP7Jt1DKA19pY5g4xdqj0AKzW3PALwPzLO26XLtGQNqHTZTtMpU+dBhF9+zjEhM8CrXREjZDuXVAxt9K8mxyWQLJlZ2WXHryjxMJRock0tNKF/ODSQAGAAAAEACIAAAAAAACAAAADWVudHlwby0wMS5zdmcAAAANZW50eXBvLTAyLnN2Z/////8AAAACAAAAUQAFQABARUBEEFRBRAUBREBQUAQUBAVBVABFEUAABAAEQARRAARUQVAQEAVEUUBAUBEBBRUAQUEQEEAFVBEAABRARABFFAUUEEBBEBQUEQAEAAAAAAA=";

const chunks = {
  "entypo-01.svg": new URL("./entypo-01.svg", import.meta.url).href,
  "entypo-02.svg": new URL("./entypo-02.svg", import.meta.url).href
};

register('entypo', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
