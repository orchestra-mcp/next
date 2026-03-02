export { TerminalSession } from './TerminalSession';

import { registerSessionType } from '../registry/SessionRegistry';
import { TerminalSession } from './TerminalSession';

registerSessionType({
  type: 'terminal',
  name: 'Terminal',
  icon: 'bx-terminal',
  description: 'Shell terminal with PTY support',
  order: 7,
  component: TerminalSession,
});
