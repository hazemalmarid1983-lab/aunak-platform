/** Canonical Airtable table IDs — central multi-center base appcjitgWsbvIebwf */
const DEFAULT_STUDENTS_TABLE_ID = "tblTidBPaVM4cf3O9";
const DEFAULT_CENTERS_TABLE_ID = "tblm1ayaXTG0vdm7d";
const DEFAULT_SPECIALISTS_TABLE_ID = "tblqTYEHCPBO23DBa";
const DEFAULT_ACCESS_TABLE_ID = "tblsGNIKRfTpMZ8Kn";
const DEFAULT_DAILY_SESSIONS_TABLE_ID = "tblnNGiaKccMSpizT";
const DEFAULT_SESSION_PERIODS_TABLE_ID = "tblkuCfFaopSsOKOG";
const DEFAULT_ATTENDANCE_TABLE_ID = "tbl1oGzt0E5jYNA5e";
const DEFAULT_GOAL_EVIDENCE_TABLE_ID = "tblnZC5LIbRWze6T9";
const DEFAULT_ATTENDANCE_CORRECTIONS_TABLE_ID = "tblpxTavOza4SAjlH";

/** Accept raw tbl… or pasted Airtable URLs like tbl…/viw…?blocks=hide */
export function sanitizeTableId(raw, fallback = "") {
  const cleaned = raw != null ? String(raw).trim() : "";
  if (!cleaned) return fallback;
  const m = cleaned.match(/tbl[a-zA-Z0-9]{10,}/);
  return m ? m[0] : fallback;
}

function resolveTableId(envKey, fallback = "", aliases = []) {
  const keys = [envKey, ...aliases];
  for (const key of keys) {
    const raw = import.meta.env[key];
    const id = sanitizeTableId(raw, "");
    if (id) return id;
  }
  return fallback;
}

function resolveDailySessionsTableId() {
  return resolveTableId(
    "VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID",
    DEFAULT_DAILY_SESSIONS_TABLE_ID,
    ["AIRTABLE_DAILY_SESSIONS_TABLE_ID"]
  );
}

export { DEFAULT_DAILY_SESSIONS_TABLE_ID };

export const AIRTABLE_TABLES = {
  centers: resolveTableId("VITE_AIRTABLE_CENTERS_TABLE_ID", DEFAULT_CENTERS_TABLE_ID),
  students: resolveTableId("VITE_AIRTABLE_STUDENTS_TABLE_ID", DEFAULT_STUDENTS_TABLE_ID),
  dailySessions: resolveDailySessionsTableId(),
  sessionPeriods: resolveTableId(
    "VITE_AIRTABLE_SESSION_PERIODS_TABLE_ID",
    DEFAULT_SESSION_PERIODS_TABLE_ID
  ),
  specialists: resolveTableId("VITE_AIRTABLE_SPECIALISTS_TABLE_ID", DEFAULT_SPECIALISTS_TABLE_ID),
  accessControl: resolveTableId("VITE_AIRTABLE_ACCESS_TABLE_ID", DEFAULT_ACCESS_TABLE_ID, [
    "VITE_AIRTABLE_ACCESS_CONTROL_TABLE_ID",
  ]),
  attendanceLedger: resolveTableId("VITE_AIRTABLE_ATTENDANCE_TABLE_ID", DEFAULT_ATTENDANCE_TABLE_ID),
  goalEvidence: resolveTableId("VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID", DEFAULT_GOAL_EVIDENCE_TABLE_ID),
  attendanceCorrections: resolveTableId(
    "VITE_AIRTABLE_ATTENDANCE_CORRECTIONS_TABLE_ID",
    DEFAULT_ATTENDANCE_CORRECTIONS_TABLE_ID
  ),
};

export const SECTION_TABLE_MAP = [
  { section: "مراكز / Centers", tableId: AIRTABLE_TABLES.centers, essential: true },
  { section: "مستفيدون / Students", tableId: AIRTABLE_TABLES.students, essential: true },
  { section: "أخصائيون / Specialists", tableId: AIRTABLE_TABLES.specialists, essential: true },
  { section: "صلاحيات / Access Control", tableId: AIRTABLE_TABLES.accessControl, essential: true },
  { section: "جلسات موثّقة / Daily Sessions", tableId: AIRTABLE_TABLES.dailySessions, essential: true },
  { section: "حصص يومية / Session Periods", tableId: AIRTABLE_TABLES.sessionPeriods, essential: true },
  { section: "حضور / Attendance Ledger", tableId: AIRTABLE_TABLES.attendanceLedger, essential: true },
  { section: "أدلة أهداف / Goal Evidence", tableId: AIRTABLE_TABLES.goalEvidence, essential: true },
  { section: "تصحيح حضور / Attendance Corrections", tableId: AIRTABLE_TABLES.attendanceCorrections, essential: true },
];
