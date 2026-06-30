/**
 * /api/tawasul/* — consolidated router (verify-token, caseload, mirror only).
 * Standalone files handle: verify-token, caseload, mirror, student-goal, assessment-sync.
 */

import { createActionRouter } from '../_handlers/dispatch.js';
import verifyToken from '../_handlers/tawasul/verify-token.js';
import caseload from '../_handlers/tawasul/caseload.js';
import mirror from '../_handlers/tawasul/mirror.js';

export default createActionRouter({
  'verify-token': { POST: verifyToken },
  caseload: { POST: caseload },
  mirror: { POST: mirror },
});
