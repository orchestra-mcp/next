export { DatabaseSession } from './DatabaseSession';

import { registerSessionType } from '../registry/SessionRegistry';
import { DatabaseSession } from './DatabaseSession';

registerSessionType({
  type: 'database',
  name: 'Database',
  icon: 'bx-data',
  description: 'SQL query editor with schema browser',
  order: 2,
  component: DatabaseSession,
});
