
import { register } from '../core.js';

const lookup = "AAAApIkYcBcabJNzz0wyQ0ZVRqVWNWVyUwhVAwYBBQkkFREe0wwkB0EyXwNBFJIGAlhwMAxEduQROvCEntQmC4h3BpfKF/2hsVS1UhMWdic9ZnvEgLaMw4b330Rqp52VMTlXkR34SuI8RecnH/jCRmxegUlDJXrkzOUmA4c8MuVASPjfANKnCWU17/ITkIkH8qST06TE/XqbrR2/g0eqXlsIkkMQghAAAAAAAQAAAAticG1uLTAxLnN2Z/////8AAAABAAAADgAAAAAAAAAAAAAAAAAAAAAAAA==";

const chunks = {
  "bpmn-01.svg": new URL("./bpmn-01.svg", import.meta.url).href
};

register('bpmn', {
  lookup,
  chunks,
  baseUrl: import.meta.url
});
