/** Canonical Airtable table IDs — env overrides with CENTRAL_TABLES fallbacks */
import { CENTRAL_TABLES } from './centralAirtable.js';

export function sanitizeTableId(raw, fallback = '') {
  const cleaned = raw != null ? String(raw).trim() : '';
  if (!cleaned) return fallback;
  const m = cleaned.match(/tbl[a-zA-Z0-9]{10,}/);
  return m ? m[0] : fallback;
}

function tableFromEnv(envKey, fallback) {
  const raw = typeof import.meta !== 'undefined' ? import.meta.env?.[envKey] : '';
  return sanitizeTableId(raw, fallback);
}

export const DEFAULT_DAILY_SESSIONS_TABLE_ID = tableFromEnv(
  'VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID',
  CENTRAL_TABLES.dailySessions
);

export const AIRTABLE_TABLES = {
  centers: tableFromEnv('VITE_AIRTABLE_CENTERS_TABLE_ID', CENTRAL_TABLES.centers),
  students: tableFromEnv('VITE_AIRTABLE_STUDENTS_TABLE_ID', CENTRAL_TABLES.students),
  dailySessions: DEFAULT_DAILY_SESSIONS_TABLE_ID,
  sessionPeriods: tableFromEnv('VITE_AIRTABLE_SESSION_PERIODS_TABLE_ID', CENTRAL_TABLES.sessionPeriods),
  specialists: tableFromEnv('VITE_AIRTABLE_SPECIALISTS_TABLE_ID', CENTRAL_TABLES.specialists),
  accessControl: tableFromEnv(
    'VITE_AIRTABLE_ACCESS_CONTROL_TABLE_ID',
    tableFromEnv('VITE_AIRTABLE_ACCESS_TABLE_ID', CENTRAL_TABLES.accessControl)
  ),
  attendanceLedger: tableFromEnv('VITE_AIRTABLE_ATTENDANCE_TABLE_ID', CENTRAL_TABLES.attendanceLedger),
  goalEvidence: tableFromEnv('VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID', CENTRAL_TABLES.goalEvidence),
  attendanceCorrections: tableFromEnv(
    'VITE_AIRTABLE_ATTENDANCE_CORRECTIONS_TABLE_ID',
    CENTRAL_TABLES.attendanceCorrections
  ),
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
