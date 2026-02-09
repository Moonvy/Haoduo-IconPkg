
import { register } from '../core.js';

const lookup = "AAABk4kZAR8YOhrCax72WB0YR3pzuSQ0EXJ5NTGEoxJDU5dSBTRGZ0RDaWSVZ1g6NY0CEIQWhQEGUb0Tth0CIQgFlguHAQsGmASbFgQZARA9qQUaAQUESQu2ASAaAQzzDSMRlQENlwMZWAJZAR9GFLMJGJVYOz8Ya9pHGzszetldD3UXHjCfBa5RD7lueCy3OVvf5xYBuoqWdv30FxxQchfK94eRxZKFFcHyv0Eu2KT8tCG/p5WgwiwqURh1A4ypjmVTrrB8yRSsacXDUtWB1W665uL/V7Y8rFs8aa14ys7BOzEHsK/5j36yjE5EbJBzYFHkx4IC7Uh+PJ1M29a+tR7Yz19t/kiRCn6LG2czyPtgAQU6UeYW9J9trDAQ7rMzLIVuRpF+uRA+CozgA+wGPCYGqf0iavPNAaZKgd1Hq0IA78bR4pfG5oKVCRGAyfHRwEuwmO0RIivImId3F77zPqxk70VV/dE2PoOpo30Y8vdTxL6p3hhRiGwyrBpaJHPXt1XrexcxBnMqbMUSiUgCyOFkkIAAAAAAAAACAAAAEmh1bWJsZWljb25zLTAxLnN2ZwAAABJodW1ibGVpY29ucy0wMi5zdmf/////AAAAAgAAAEgAQRAEBAEEAUFBBAAQABUQQAEEBARAAVAQBBUFAFRQVEBAAAUEAAFQBBAEQQFBABQUAUABABAAAQAAAARAAVBUQAREEBFQBBEAAAAA";

const chunks = {
  "humbleicons-01.svg": new URL("./humbleicons-01.svg", import.meta.url).href,
  "humbleicons-02.svg": new URL("./humbleicons-02.svg", import.meta.url).href
};

register('humbleicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
