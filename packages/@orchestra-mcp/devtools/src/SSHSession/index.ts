export { SSHSession } from './SSHSession';

import { registerSessionType } from '../registry/SessionRegistry';
import { SSHSession } from './SSHSession';

registerSessionType({
  type: 'ssh',
  name: 'SSH',
  icon: 'bx-server',
  description: 'SSH terminal with SFTP file browser',
  order: 4,
  component: SSHSession,
});
