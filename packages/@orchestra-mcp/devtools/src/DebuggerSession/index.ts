export { DebuggerSession } from './DebuggerSession';

import { registerSessionType } from '../registry/SessionRegistry';
import { DebuggerSession } from './DebuggerSession';

registerSessionType({
  type: 'debugger',
  name: 'Debugger',
  icon: 'bx-bug',
  description: 'Debug applications with DAP protocol',
  order: 7,
  component: DebuggerSession,
});
