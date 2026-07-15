/** Canonical Airtable table IDs — central multi-center base appcjitgWsbvIebwf */
import { CENTRAL_TABLES } from './centralAirtable.js';

/**
 * Env overrides caused production 403s when share/view URLs or the wrong tbl…
 * were pasted into multiple Vercel keys. Defaults are the source of truth.
 * Set VITE_AIRTABLE_ALLOW_TABLE_OVERRIDES=true only for deliberate staging forks.
 */
const ALLOW_OVERRIDES = import.meta.env.VITE_AIRTABLE_ALLOW_TABLE_OVERRIDES === 'true';

/** Accept raw tbl… or pasted Airtable URLs like tbl…/viw…?blocks=hide */
export function sanitizeTableId(raw, fallback = '') {
  const cleaned = raw != null ? String(raw).trim() : '';
  if (!cleaned) return fallback;
  const m = cleaned.match(/tbl[a-zA-Z0-9]{10,}/);
  return m ? m[0] : fallback;
}

function resolveTableId(envKey, fallback, aliases = []) {
  if (!ALLOW_OVERRIDES) return fallback;
  const keys = [envKey, ...aliases];
  for (const key of keys) {
    const id = sanitizeTableId(import.meta.env[key], '');
    if (id) return id;
  }
  return fallback;
}

export const DEFAULT_DAILY_SESSIONS_TABLE_ID = CENTRAL_TABLES.dailySessions;

export const AIRTABLE_TABLES = {
  centers: resolveTableId('VITE_AIRTABLE_CENTERS_TABLE_ID', CENTRAL_TABLES.centers),
  students: resolveTableId('VITE_AIRTABLE_STUDENTS_TABLE_ID', CENTRAL_TABLES.students),
  dailySessions: resolveTableId(
    'VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID',
    CENTRAL_TABLES.dailySessions,
    ['AIRTABLE_DAILY_SESSIONS_TABLE_ID']
  ),
  sessionPeriods: resolveTableId(
    'VITE_AIRTABLE_SESSION_PERIODS_TABLE_ID',
    CENTRAL_TABLES.sessionPeriods
  ),
  specialists: resolveTableId(
    'VITE_AIRTABLE_SPECIALISTS_TABLE_ID',
    CENTRAL_TABLES.specialists
  ),
  /** Login path — never trust scrambled Vercel table env */
  accessControl: CENTRAL_TABLES.accessControl,
  attendanceLedger: resolveTableId(
    'VITE_AIRTABLE_ATTENDANCE_TABLE_ID',
    CENTRAL_TABLES.attendanceLedger,
    ['VITE_AIRTABLE_ATTENDANCE_LEDGER_TABLE_ID']
  ),
  goalEvidence: resolveTableId(
    'VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID',
    CENTRAL_TABLES.goalEvidence
  ),
  attendanceCorrections: resolveTableId(
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
