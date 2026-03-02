export { LogViewerSession } from './LogViewerSession';

import { registerSessionType } from '../registry/SessionRegistry';
import { LogViewerSession } from './LogViewerSession';

registerSessionType({
  type: 'logs',
  name: 'Log Viewer',
  icon: 'bx-file',
  description: 'Stream and search application logs',
  order: 5,
  component: LogViewerSession,
});
