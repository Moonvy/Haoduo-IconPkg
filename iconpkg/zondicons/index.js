
import { register } from '../core.js';

const lookup = "AAABn4kZASkYPBqEwV0cWB5UVEcXRCUnU4dEQ0JhZaNVxHVIN5c3JCKURXNHVlZYOwsYAxAZsQQECwwBtgE/aqMDCQETBWwEIAjGDwMeAgwhoAGbARrfAQarAYQEDw8CHTgHAn0WBaABFAg7AlkBKUSDYaz5D0kUDTRxnYesgWhxBx2wIvidrWD4IwLr4nNNhnquvICIdX4XC8lomnIDl9OZvjWYuQNtuQVpIv2BEb7BWw33FSHZQ7XoMM4UXfQTwfT9++yQv0R7xrVTwaSOW7YcNumTZyixHVKrAQmBaOWOWSHVnTQ2s8D6+iuCb8XuI6dhP8SwfxG6Gplg36OnQIvKyf+EYa5yJeY4X1jI+VU1pzMt58cN07fO8fo5DlConWtAmmLPudoi05FWPLzkGGzoZBF8BPB5p3vsoRlHeqKzSiAmStE7lWknPWqf/5EzF1RVXXUTGjbyh7roBed1m6ym8xUcGu0fdUw+dTtCEiqcvsRN8rk9rHC+3hxaYPPSaHY4lnDIG5l8jZH+RumF3Q1GNjm/VJbvckigYFABAGgQAAAAAAACAAAAEHpvbmRpY29ucy0wMS5zdmcAAAAQem9uZGljb25zLTAyLnN2Z/////8AAAACAAAASwAAQEQVAAEAQEAAVEAAEBFABEUABUARAAAEBAAUQFFEBFUBBQVFEAQBBEUEFRABERBQAQBEEQAQFEABEEQBARVBEAAQUQEEAQEEAAAAAAA=";

const chunks = {
  "zondicons-01.svg": new URL("./zondicons-01.svg", import.meta.url).href,
  "zondicons-02.svg": new URL("./zondicons-02.svg", import.meta.url).href
};

register('zondicons', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
