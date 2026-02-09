
import { register } from '../core.js';

const lookup = "AAAAlokYZBQan6jsGkpYR0hEF0Y1VkOEVZgBZAGBAQUKHQs5DwoCSxwEAQbaBwJYZG62Odcb/SBKutsypjb0B/QCNCri9EhrbFCyrJPXRybUq2nP5r//kk4ldVSovP4P+V01vMQGba+o+eVnyE6Mp5A0o2/qokcNl8vFkvlzluY5ZiUeg5XsRP+tJPLzkOTr0S2Mtw5DAgIAAAAAAAEAAAAOZmxhdC11aS0wMS5zdmf/////AAAAAQAAAA0AAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "flat-ui-01.svg": new URL("./flat-ui-01.svg", import.meta.url).href
};

register('flat-ui', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
