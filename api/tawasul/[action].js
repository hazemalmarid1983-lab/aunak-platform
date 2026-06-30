/**
 * /api/tawasul/* — consolidated router (single Serverless Function on Hobby plan).
 * Handlers live in api/_handlers/tawasul/ (self-contained, no sovereign import chain).
 */

import { createActionRouter } from '../_handlers/dispatch.js';
import verifyToken from '../_handlers/tawasul/verify-token.js';
import caseload from '../_handlers/tawasul/caseload.js';
import mirror from '../_handlers/tawasul/mirror.js';
import studentGoal from '../_handlers/tawasul/student-goal.js';
import assessmentSync from '../_handlers/tawasul/assessment-sync.js';

export default createActionRouter({
  'verify-token': { POST: verifyToken },
  caseload: { POST: caseload },
  mirror: { POST: mirror },
  'student-goal': { POST: studentGoal },
  'assessment-sync': { POST: assessmentSync },
});
