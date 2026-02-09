
import { register } from '../core.js';

const lookup = "AAAA8IkYpxgiGoSTvJBRg3pYWFKFZUEzVlVjRDZVMDhYIQQR8CUh3AMKoQIDEyNGBgMHARY/BxtoCAQZARglBckGAgJYp3mBqvlUx7arrIzw9VFbeAqfZM3sN3em2Pu1wYEGOp//w9b/1SlPPqkQZ5QIAUlkzO8Xe1OL5bG8Iuu0/sqs7wkvTX+aEyHtN5eqdfGN5J46vAHiXp3HGVNaIaJAfEe3tkYIs1PNhNHOlotIBLYgPR6QBSgshMCQfCkRgiQK5DgZgWnsQBE0HLGdSxkZHPDdPqiBR7OFSzjI47f3d2xEcyEl77slpQeZRQBBQkAAAAAAAAEAAAAKbWFwLTAxLnN2Z/////8AAAABAAAAFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=";

const chunks = {
  "map-01.svg": new URL("./map-01.svg", import.meta.url).href
};

register('map', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
