export { FileExplorerSession } from './FileExplorerSession';

import { registerSessionType } from '../registry/SessionRegistry';
import { FileExplorerSession } from './FileExplorerSession';

registerSessionType({
  type: 'file-explorer',
  name: 'File Explorer',
  icon: 'bx-folder-open',
  description: 'Browse and manage project files',
  order: 1,
  component: FileExplorerSession,
});
