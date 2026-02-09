
import { register } from '../core.js';

const lookup = "AAABM4kY2BgsGs9AK+1WBsezNldVQSVGJ0RSVEV4ZReIVUNkMlgtU5wBp20ChE4OA8wCFgIJDREWBZcBAwUBKwldDwFCEiElDDyDCAIPByAHJQMBAljYfWMg13HOu2y4I4tAHBGHW0Hu8FQRPE2Vx5ryU8aRVYPzES7GPIb3DrafP5cRkRWE45hQne9Bfwq2eyqV9i0HYOmjMV9584eoL4DyJTvXonsR91Q4rBu208xPOqGGFuR4v3FxKn4vckRWBXME/6BVAwmNIDXVudzcA0qVwH2bCxzNmStar77nmafXxeaAy+rNEH95rGRwufweuWDvjnBZy53XdD4mUH7vJGzpkYGyYB2BXB5hSPOPi4PxFQc611iLOKm6a23SWMINBY4j6Mj27jO4eyasQmO9RgKQCAACAAAAAAACAAAACnVpdC0wMS5zdmcAAAAKdWl0LTAyLnN2Z/////8AAAACAAAANgAAAAAAAAAAAAAAABAAAAAAABBEAAAAAAAAEAAEAEABAAAQAEAAAARAEAAQAAAAAQAAEAAAAAAAAAA=";

const chunks = {
  "uit-01.svg": new URL("./uit-01.svg", import.meta.url).href,
  "uit-02.svg": new URL("./uit-02.svg", import.meta.url).href
};

register('uit', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
