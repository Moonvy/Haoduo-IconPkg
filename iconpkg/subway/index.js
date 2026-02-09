
import { register } from '../core.js';

const lookup = "AAABqIkZATIYPhoJ+bqRWB8mhFRVRISFVFayYTVlZEZyNjsUR2WCRUNiJEd4NHY3WDofAjsGWRoEHS4SfxAHqAERAaAEQQEOIwVfBQIB9AI5DYRbARGIBgQdND4KIQUPFgJOARDhAQUTceQBAlkBMjow9No2ophp1vV+Ezm8LKGV92//xVThcGl5PDslCwoWsXOJ3UTa3zcPN3d7RpXQe+mQou/qQB4Xw1vgUCtol1yR9NMd/qXVlII92jgVTUSHOeXtDDcRw3nKA75fgihDVwPbUKyBJB7hSpsA2TJkAoUbjgEtj/vcwQKmurAJfA0tZwWrBxqba13de/uMmUOfGn47tZGvR90pIr+kv4tsxa6YbCD2wDo4NfnzwxPPoLfFegRbpg5Hg7gxPaLrMJyLcV+h7b1kv+fxu9+DirNEW/t0LUHDrDNFPe6XDc//DFwL2WnjtxTtCs2Biq9EllfXafTuuNomG9Rtx+7EqCQtNGNxvjSUEf0jjSqwiWmf79GBWYz+Vgc/bGD8Dp00rOxlx90XiCqgQCxknV0omZSq5aSXMkgCA1AAIAQJIQAAAAACAAAADXN1YndheS0wMS5zdmcAAAANc3Vid2F5LTAyLnN2Z/////8AAAACAAAATQABFEABUBAVEBEEAAEURAQVEAUBFFAAQBEQEBRAVAQQQAEQEFQAAQEAAABAEQAFEEAQFEEEEQQBQBBAAVUURFRAAVAVAFFERAEUREAAAAAAAA==";

const chunks = {
  "subway-01.svg": new URL("./subway-01.svg", import.meta.url).href,
  "subway-02.svg": new URL("./subway-02.svg", import.meta.url).href
};

register('subway', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
