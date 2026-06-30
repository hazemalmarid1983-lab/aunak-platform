/** Canonical Airtable table IDs for all hub sections. */
const DEFAULT_STUDENTS_TABLE_ID = "tblzYmBGmCxx2vdcr";

function resolveTableId(envKey, fallback = DEFAULT_STUDENTS_TABLE_ID) {
  const raw = import.meta.env[envKey];
  const cleaned = raw != null ? String(raw).trim() : "";
  return cleaned || fallback;
}

/** tblDailySessions — سجل الجلسات (cloud, isolated from Students). */
export const DEFAULT_DAILY_SESSIONS_TABLE_ID = "tbl3mlewMLvqp6AXB";

function resolveDailySessionsTableId() {
  const raw = import.meta.env.VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID;
  const cleaned = raw != null ? String(raw).trim() : "";
  if (/^tbl[a-zA-Z0-9]{10,}$/i.test(cleaned)) return cleaned;
  if (cleaned) {
    console.warn(
      "[airtable] Invalid VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID (must start with tbl):",
      cleaned
    );
  }
  return DEFAULT_DAILY_SESSIONS_TABLE_ID;
}

export const AIRTABLE_TABLES = {
  students: resolveTableId("VITE_AIRTABLE_STUDENTS_TABLE_ID", DEFAULT_STUDENTS_TABLE_ID),
  dailySessions: resolveDailySessionsTableId(),
  scientificItems: "tblnCbBSmwDWwO5SJ",
  specialists: resolveTableId("VITE_AIRTABLE_SPECIALISTS_TABLE_ID", "tblnmcLd5M3U6sErl"),
  abcData: "tblJ580ptTVkv07hD",
  safeMedia: "tbljdOSE8CozrzBZN",
  melodyLab: "tblMddsXqCz91hfoU",
  communityResources: "tblV28iWarzve32pP",
  accessControl: "tblfBvd5WI7alVCFU",
  learningDifficulties: "tblcNXSmU90TomEHH",
  emotionalMonitoring: "tblokLHmSHss3FQft",
  /** Set VITE_AIRTABLE_GOAL_ATTEMPTS_TABLE_ID after creating «محاولات الأهداف | Goal Attempts» in base appaGfKj4vYhMw0cb */
  goalAttempts: resolveTableId("VITE_AIRTABLE_GOAL_ATTEMPTS_TABLE_ID", ""),
  /** Set VITE_AIRTABLE_SUMMER_ACADEMY_TABLE_ID after creating «الأكاديمية الصيفية | Summer Academy» */
  summerAcademy: resolveTableId("VITE_AIRTABLE_SUMMER_ACADEMY_TABLE_ID", ""),
};

export const SECTION_TABLE_MAP = [
  { section: "السجل الحي / Live Dashboard", tableId: AIRTABLE_TABLES.students },
  { section: "سجل الجلسات / Session Registry", tableId: AIRTABLE_TABLES.students },
  { section: "مقاييس التشخيص / Diagnostics", tableId: AIRTABLE_TABLES.students },
  { section: "الفصول الدراسية / Classrooms", tableId: AIRTABLE_TABLES.students },
  { section: "مجتمع عونك / Community", tableId: AIRTABLE_TABLES.students },
  { section: "تعديل السلوك (ABC) / Behavior Mod", tableId: AIRTABLE_TABLES.abcData },
  { section: "مكتبة البنود / Scientific Items", tableId: AIRTABLE_TABLES.scientificItems },
  { section: "الأخصائيين / Specialists", tableId: AIRTABLE_TABLES.specialists },
  { section: "مكتبة الوسائط / Safe Media", tableId: AIRTABLE_TABLES.safeMedia },
  { section: "مختبر الألحان / Melody Lab", tableId: AIRTABLE_TABLES.melodyLab },
  { section: "موارد المجتمع / Resources", tableId: AIRTABLE_TABLES.communityResources },
  { section: "التحكم في الوصول / Access Control", tableId: AIRTABLE_TABLES.accessControl },
  { section: "صعوبات التعلم / Learning Center", tableId: AIRTABLE_TABLES.learningDifficulties },
  { section: "الرصد العاطفي / Emotional Monitoring", tableId: AIRTABLE_TABLES.emotionalMonitoring },
  { section: "الدرع الذكي / Smart Shield (Crisis)", tableId: AIRTABLE_TABLES.emotionalMonitoring },
  { section: "البصمة الحيوية / Biometrics", tableId: AIRTABLE_TABLES.students },
  { section: "Daily Sessions / Reconciliation", tableId: AIRTABLE_TABLES.dailySessions },
  { section: "محاولات الأهداف / Goal Attempts", tableId: AIRTABLE_TABLES.goalAttempts },
  { section: "الأكاديمية الصيفية / Summer Academy", tableId: AIRTABLE_TABLES.summerAcademy },
];
