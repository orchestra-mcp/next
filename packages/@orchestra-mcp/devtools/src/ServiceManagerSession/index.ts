export { ServiceManagerSession } from './ServiceManagerSession';

import { registerSessionType } from '../registry/SessionRegistry';
import { ServiceManagerSession } from './ServiceManagerSession';

registerSessionType({
  type: 'services',
  name: 'Services',
  icon: 'bx-server',
  description: 'Manage local development services and stacks',
  order: 6,
  component: ServiceManagerSession,
});
