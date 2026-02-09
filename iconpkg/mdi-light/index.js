
import { register } from '../core.js';

const lookup = "AAABqIkZATAYPRqVcz3mWB9DdaS1OWUSZ6ZGRlgzE2U2VERKVTViYTR0M2ZXVzcDWDwTCUMErwQKkhOXDQJLGl8cW4IcCgMPeQkCJTGcAQYVAQwG8i4ZMhMoAwEiAgcCAwYBPjrKAxuCAwHkAgECWQEwR+QF1sXbnOUhFrQhlAE1R5vkkL8pAFA0YnUwXWBpD383AH08yn0ivsJfnbaKfir1bahtOxjSrfXcfE8hyqWFvHsScpW+lWaXMh0u0qwUXxs3c2fRLIReBd4wHd1afPDBAMWVMvLKdKFHvVAq4xGnGN0x/drQcGdBrx5JsCZs7IwNrR4gBNDrTrlNxl2gP1rb1mC6U89KKoVtcI7rR5W1bP6MawOjvRoVe1ZzOKPr5CRskLwH1bP0W0xBM6eufSCsD9SMrGQ3c4gL6FHxM7+8eOxZzz9HacdHUBTonXbPWAS9GyKNefLogItTSM7B/pgdZOJ8YGz3SCjd0ion86p2PrjoEGfVtNAHdZC70nsc10M1rK2EbMNGCowJVxitJbbRa4HGDb8kv4mGNtfW5FMbTUgBMAgNABAEEAAAAAACAAAAEG1kaS1saWdodC0wMS5zdmcAAAAQbWRpLWxpZ2h0LTAyLnN2Z/////8AAAACAAAATARABVAEBAQAUARBVFABUBUFEAUAEAAABEABAQEEAUEBQEUAAEAAFBQRVRAUVBUBBQQUBFEERAEAFQFEQEQRAAAAQFAQQAEAAEBQVAUAAAAA";

const chunks = {
  "mdi-light-01.svg": new URL("./mdi-light-01.svg", import.meta.url).href,
  "mdi-light-02.svg": new URL("./mdi-light-02.svg", import.meta.url).href
};

register('mdi-light', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
