/**
 * B2G server adapter — HMAC with B2G_HMAC_SALT + re-exports from shared module.
 */

import { createHmac } from 'crypto';
import {
  formatB2GChildCode,
  filterStudentsForB2G,
  filterSessionsForB2G,
  isB2GRole,
  B2G_ROLE,
  anonymizeStudentRecord,
} from '../../../src/lib/b2gAnonymization.js';

export { isB2GRole, B2G_ROLE, anonymizeStudentRecord };

function resolveB2GSalt() {
  return (
    process.env.B2G_HMAC_SALT ||
    process.env.AIRTABLE_API_KEY?.slice(0, 16) ||
    'aunak-b2g-sovereign-salt'
  );
}

/** Stable pseudonym CHD-XXXX from Airtable record id (HMAC-SHA256, first 4 hex). */
export function b2gChildCode(recordId) {
  const rec = String(recordId ?? '').trim();
  if (!rec) return 'CHD-0000';
  const digest = createHmac('sha256', resolveB2GSalt()).update(rec).digest('hex');
  return formatB2GChildCode(digest);
}

export function filterAirtableResponseForB2G(body, { studentsTableHint = false, sessionsTableHint = false } = {}) {
  if (studentsTableHint && body != null) {
    return filterStudentsForB2G(body, b2gChildCode);
  }
  if (sessionsTableHint && body != null) {
    return filterSessionsForB2G(body);
  }
  return body;
}
