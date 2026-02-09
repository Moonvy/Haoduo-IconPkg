
import { register } from '../core.js';

const lookup = "AAACsokZAfQYZBoYce8lWDJmM4dTI0NFZnQjdkQ2VCRSRFhTZpWDc3R0NkR0J3ZVN3FDVohod2RCcjJWNjqHNlVmdFhqAxoKA50B1QUDNhECAisFASoV6AEBAiWqAwIEBwMZfwgBAwEC7QEDBxI5DMEGAVcBkwEHgwEDUyoJAxQBREwv+AEOGpABBwclHYYFvAbtAjTZAVIZAwQBgQEBCmIDjiMNrQMvAQNVZwSxAgJZAfSZKmXGYA/WnqkxCgotCPOZS4BDOdrDcnjg+zAvKix8vruG1acZOVLtXgO0eB+pO1pNWtScbmTZTZgu74yexDeRBj7U45sqhpfGaBT+UVAF5jlLqIhguy2pana1fs1M4fZicmmZxRL6oFsbPuFS6X509idal+iEfyYcCgCkip4mi8sb0R+QnDlG2bmlwqSxXWksMmngeLeONeXAeIJK12eYbEtLZzrL+LOzMPs27GjG4C/7Ak24QUgVUS9vhkCSMz1ussbca/2c92HeS639YQPKp0lOTftz4ZC9f9duWCgQADdZ8JGA8vjRobb3cO1mxTrc3nCgEWkZdyj3ETNI8E2NFei/ABeDik5U/Ftfjd0YI+Tvvf6f+B+Nw7R/z55gZkeT4uWrkUnlMg8RoZ1QnHeRJEFy30mx58IkXx8HUKk1KzY8IU8+XVIbV2y6HAkDmvicUFA3xdSDY0WMyTpcn+7lbvnJCpz6iM0aK2/kiN68iW/z6AEbh7W5P/r2c0YllIjvHZX+k3/iOsQ3ukg2R/ozmOqY1J9/KTnL0JL4aHGPk8vV2e/HGR5YSadhFB9bld9EwPimAH9GZwZqj5bwBdokCnAj4sckS1eLCt462EGCOFZf9K1pNvDmkJMNXGt3qaCO30QlhtgqIF3vcKETml8YxRC0t00AAgAAEQAAAgcQFCIAAAAAAAMAAAAXc3RyZWFtbGluZS1jeWJlci0wMS5zdmcAAAAXc3RyZWFtbGluZS1jeWJlci0wMi5zdmcAAAAXc3RyZWFtbGluZS1jeWJlci0wMy5zdmf/////AAAAAgAAAH2FhUlIBKQpqogAgUBIKKRgAAYJRpRpRVAARRBFCIVRQAJQQESVllUURWVkRFgBCgYRiAKQUFEVVAgUFkZkYkREZVYVglBhSUoBCQqFGRQgZaJYkAhElBQBFamFBBaWAUKBiRRVZkVmWEAQEShgVkAARhSZEhFYEVWZFgRIVAAAAAA=";

const chunks = {
  "streamline-cyber-01.svg": new URL("./streamline-cyber-01.svg", import.meta.url).href,
  "streamline-cyber-02.svg": new URL("./streamline-cyber-02.svg", import.meta.url).href,
  "streamline-cyber-03.svg": new URL("./streamline-cyber-03.svg", import.meta.url).href
};

register('streamline-cyber', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
