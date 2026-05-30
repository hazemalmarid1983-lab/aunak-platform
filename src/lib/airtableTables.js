/** Canonical Airtable table IDs for all 15 hub sections. */
export const AIRTABLE_TABLES = {
  students: "tblzYmBGmCxx2vdcr",
  scientificItems: "tblnCbBSmwDWwO5SJ",
  specialists: "tblnmcLd5M3U6sErl",
  abcData: "tblJ580ptTVkv07hD",
  safeMedia: "tbljdOSE8CozrzBZN",
  melodyLab: "tblMddsXqCz91hfoU",
  communityResources: "tblV28iWarzve32pP",
  accessControl: "tblfBvd5WI7alVCFU",
  learningDifficulties: "tblcNXSmU90TomEHH",
  emotionalMonitoring: "tblokLHmSHss3FQft",
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
];
