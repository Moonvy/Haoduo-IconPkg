
import { register } from '../core.js';

const lookup = "AAABBYkYthglGv/efKRTdEkmVlRWtkNZNTVjtYFjFUQkAlglEpQBHgIPAtkCDgEtZgk64xgCH7kEBwY0Ag4dGOAD3AcqDwsGAwJYtlxpCJUm12SJYScw/9JmlKaPKGx5rX29HHthGCfVJpekwF3s97DVk1NkyIlURQRAV19kt5iQc1gc4Zvn2g2npaK7a32Y0c70P1OWCXteSxkW1dpRRdzp4AGa5RSwVSV9NeAAFOnLDjQeSmU6hp/FYh9GJ284JtYWu+k64IEhoa1+oJTQD7V+/5pXYskaOLy89iMo+PhtSlScxPwe4EvBV1syFixJcmOJH3YzBxohNTKLjjdi/zcTRQAABJQUAAAAAAEAAAAMY3VpZGEtMDEuc3Zn/////wAAAAEAAAAXAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";

const chunks = {
  "cuida-01.svg": new URL("./cuida-01.svg", import.meta.url).href
};

register('cuida', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
