
import { register } from '../core.js';

const lookup = "AAABa4kZAQAYNBpcJaieWBonRjZkczNmQ1JTaXqxRMQpYjUnQjVlmTRCRFg1AyUDPgUNPQI9AUeGAQQEBgSWByWTBgbAIh45Bu82nQIDYhIHFQMgEQcVJKoIrAkCBQEuAwICWQEA62DMyfgieJCMgNPC3Jldc/KnXLRx9wIQxZPFX+HthQH16e0fNJ+rXu3VU6YbmmHjmWV6wYOJVBPBqwc7rWKTD5AYDzdycVbFMz5SYOqIyvcuIXui/JA193gzlTy2Grf+ePt7jjzn14uiKqJ+2fzqeioyQmq73W4rzfgXVOHQMJGrPN+46O8xj03q97kwAWsG2SpuoqfbVu7Kezw8VEhlcpyuNhbYAfOi5lBW2mPNwre6VEiKVwaCzCI+EtmMFb/p6HTbsR22/T2vJ2wuVC+M68ihne9UaH36osi/XztgzTVLe3pP4TkhJB6ymf+6ao+QTEd88TQpqYqoNrRyEOfvqkcCRAEBQQAAAAAAAAIAAAAPZmxhZ3BhY2stMDEuc3ZnAAAAD2ZsYWdwYWNrLTAyLnN2Z/////8AAAACAAAAQAQAQUBAEABABAFBBAUAFUUAAAAABBAAAQAAAAEAAAABAAQRAABARUAAAAQAABAAAQFAAFEBQBBAAEFARAQEQQUAAAAA";

const chunks = {
  "flagpack-01.svg": new URL("./flagpack-01.svg", import.meta.url).href,
  "flagpack-02.svg": new URL("./flagpack-02.svg", import.meta.url).href
};

register('flagpack', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
