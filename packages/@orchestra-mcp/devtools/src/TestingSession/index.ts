export { TestingSession } from './TestingSession';

import { registerSessionType } from '../registry/SessionRegistry';
import { TestingSession } from './TestingSession';

registerSessionType({
  type: 'testing',
  name: 'Testing',
  icon: 'bx-test-tube',
  description: 'Multi-framework test runner with real-time output',
  order: 8,
  component: TestingSession,
});
