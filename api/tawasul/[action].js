/**
 * /api/tawasul/* — single Serverless Function (Vercel Hobby limit).
 * Routes: mirror, assessment-sync
 */

import { createActionRouter } from '../_handlers/dispatch.js';
import mirror from '../_handlers/tawasul/mirror.js';
import assessmentSync from '../_handlers/tawasul/assessment-sync.js';

export default createActionRouter({
  mirror: { POST: mirror },
  'assessment-sync': { POST: assessmentSync },
});
