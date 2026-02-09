
import { register } from '../core.js';

const lookup = "AAABEYkYvhgmGnlsjftTWEFCVUYnGTNzR5o2NySVZYI0lVgpCgUHCB8LYAajAYsCFgMCOQtDpDyqDh4IrgQDAgX+FgobA8UBAwEMpgYCWL52I1Dk0xYqzUTcOJg8Ds0JWGPKHms+h3/SEYuyWpXyDb3omnDXgUBCJGERPAPzB6CdY2T26PfHu41smVij+Nel3FCRj/8mtn0urPwxHotgflXvMwcqxr0rfoHGeTWOvquH1XG9ETqDnYMHFfPv48mekXt4cfMPLXJDbNeGYKCp7xERG3svEUhtb6OLuZsV1+SVTRvxJVUjwrafdJGny3sFic5ZIPB62VxW6VTmAUHJSpVby1OXv2msxYLAYH8ERQYoAAQAAAAAAAEAAAAKdWlzLTAxLnN2Z/////8AAAABAAAAGAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "uis-01.svg": new URL("./uis-01.svg", import.meta.url).href
};

register('uis', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
