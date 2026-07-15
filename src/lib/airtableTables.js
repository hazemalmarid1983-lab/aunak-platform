/** Canonical Airtable table IDs — central multi-center base appcjitgWsbvIebwf */
import { CENTRAL_TABLES } from './centralAirtable.js';

/**
 * Production table IDs are locked to CENTRAL_TABLES.
 * Do not read Vercel VITE_*_TABLE_ID overrides here — scrambled/view URLs caused 403s.
 */
export function sanitizeTableId(raw, fallback = '') {
  const cleaned = raw != null ? String(raw).trim() : '';
  if (!cleaned) return fallback;
  const m = cleaned.match(/tbl[a-zA-Z0-9]{10,}/);
  return m ? m[0] : fallback;
}

export const DEFAULT_DAILY_SESSIONS_TABLE_ID = CENTRAL_TABLES.dailySessions;

export const AIRTABLE_TABLES = {
  centers: CENTRAL_TABLES.centers,
  students: CENTRAL_TABLES.students,
  dailySessions: CENTRAL_TABLES.dailySessions,
  sessionPeriods: CENTRAL_TABLES.sessionPeriods,
  specialists: CENTRAL_TABLES.specialists,
  accessControl: CENTRAL_TABLES.accessControl,
  attendanceLedger: CENTRAL_TABLES.attendanceLedger,
  goalEvidence: CENTRAL_TABLES.goalEvidence,
  attendanceCorrections: CENTRAL_TABLES.attendanceCorrections,
};

export const SECTION_TABLE_MAP = [
  { section: 'مراكز / Centers', tableId: AIRTABLE_TABLES.centers, essential: true },
  { section: 'مستفيدون / Students', tableId: AIRTABLE_TABLES.students, essential: true },
  { section: 'أخصائيون / Specialists', tableId: AIRTABLE_TABLES.specialists, essential: true },
  { section: 'صلاحيات / Access Control', tableId: AIRTABLE_TABLES.accessControl, essential: true },
  { section: 'جلسات موثّقة / Daily Sessions', tableId: AIRTABLE_TABLES.dailySessions, essential: true },
  { section: 'حصص يومية / Session Periods', tableId: AIRTABLE_TABLES.sessionPeriods, essential: true },
  { section: 'حضور / Attendance Ledger', tableId: AIRTABLE_TABLES.attendanceLedger, essential: true },
  { section: 'أدلة أهداف / Goal Evidence', tableId: AIRTABLE_TABLES.goalEvidence, essential: true },
  {
    section: 'تصحيح حضور / Attendance Corrections',
    tableId: AIRTABLE_TABLES.attendanceCorrections,
    essential: true,
  },
];
