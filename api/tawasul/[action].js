/**
 * /api/tawasul/* — single Serverless Function (Vercel Hobby limit).
 * Routes: verify-token, mirror, assessment-sync
 */

import { createActionRouter } from '../_handlers/dispatch.js';
import verifyToken from '../_handlers/tawasul/verify-token.js';
import mirror from '../_handlers/tawasul/mirror.js';
import assessmentSync from '../_handlers/tawasul/assessment-sync.js';

export default createActionRouter({
  'verify-token': { POST: verifyToken },
  mirror: { POST: mirror },
  'assessment-sync': { POST: assessmentSync },
});
