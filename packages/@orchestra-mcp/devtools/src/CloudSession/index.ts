export { CloudSession } from './CloudSession';

import { registerSessionType } from '../registry/SessionRegistry';
import { CloudSession } from './CloudSession';

registerSessionType({
  type: 'cloud',
  name: 'Cloud',
  icon: 'bx-cloud',
  description: 'Multi-cloud resource dashboard (AWS, GCP, Azure)',
  order: 9,
  component: CloudSession,
});
