
import { register } from '../core.js';

const lookup = "AAABk4kZASAYOhpv6l0lWB1LRldCNFRURpdkeFRzdFJCJyc0WYOHRRZiUyZHVVg51igUAxgoGwI0EgIBGgQTN6kBTgNPoQ8SARItHg0BCBg7kgUBAgelBgYFowOMB3sFPgYBQAEiBhcJAlkBIBveh74vEtmfvpTjy0JJF3XRx9ad0daCCt8XW6J8bTB7LFgdiYN/n+gdGRs6QePiBkjvlLC+rWVRv4+l01UT8lQXdaxZatmW8Mm/B0ktOxQRqMx7qWYuKnDKNk3W4nNFB95qPpRbzLOVV8697YaARJUors/jaYP65rCmnZxT0SN6DgBD0avGnFnJjUJqz2mRG4LaP8DthoLiFBizLPR0z1KFNL/X13lXeEDvW2AeFo854Hmmwj/mkbs6Vb5jkK/L7R2HGJ/XSvPMtzDylGbCJ9iWqANJMrqfDKAzYqmiHR4zRLCt/MFzjpPMflPUBTtTrgBUIZ6Q9w7hLM7YepJzTlRwJcBxmKAeSJ5J5btoFRDynEftAf8UW+Zm07sXzNO300gAgABBAoQJAAAAAAACAAAADWNpcmN1bS0wMS5zdmcAAAANY2lyY3VtLTAyLnN2Z/////8AAAACAAAASBAAAEAAEBEAARQRBAVBUUQBABFERUBBEEQAVARAEFAAAFAAEAFAAEVUBBAAFBQBEARREAUAAVVAVQABQARABAQAEABAABAAEAAAAAA=";

const chunks = {
  "circum-01.svg": new URL("./circum-01.svg", import.meta.url).href,
  "circum-02.svg": new URL("./circum-02.svg", import.meta.url).href
};

register('circum', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
