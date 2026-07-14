/**
 * Lean hub — ministry / special-education core only.
 * Theatrical modules load only with ?full=1 or VITE_HUB_FULL=true.
 */

export function isHubFullMode() {
  if (import.meta.env.VITE_HUB_FULL === 'true') return true;
  if (typeof window === 'undefined') return false;
  try {
    return new URLSearchParams(window.location.search).get('full') === '1';
  } catch {
    return false;
  }
}

/** Essential sections for Oman MoSD / center demo */
export const HUB_CORE_MAIN = [
  'governance',
  'assessmentProtocol',
  'enrollment',
  'registry',
  'reports',
  'specialists',
  'access',
];

export const HUB_CORE_SIDE = ['live', 'biometrics'];

/** Non-essential — hidden unless full mode */
export const HUB_THEATRICAL = new Set([
  'community',
  'emotion',
  'crisis',
  'research',
  'scientific',
  'media',
  'behavior',
  'diagnostics',
  'classrooms',
  'learning',
  'resources',
]);

export function filterHubNavItems(items) {
  if (isHubFullMode()) return items;
  return items.filter((item) => !HUB_THEATRICAL.has(item.id));
}

export function hubSensorsEnabled() {
  return isHubFullMode();
}

/**
 * Airtable keep / archive map (manual cleanup checklist — do NOT auto-delete).
 * keep = required for current product path
 * archive = safe to hide/rename in Airtable UI; do not delete until confirmed empty
 */
export const AIRTABLE_CLEANUP_GUIDE = {
  keep: [
    { id: 'tblm1ayaXTG0vdm7d', name: 'Centers', why: 'سجل المراكز · نوع · نوبات دوام' },
    { id: 'tblTidBPaVM4cf3O9', name: 'Students', why: 'المستفيدون · بروتوكول · أهداف · توكنات' },
    { id: 'tblqTYEHCPBO23DBa', name: 'Specialists', why: 'تربية خاصة / نطق / وظيفي…' },
    { id: 'tblsGNIKRfTpMZ8Kn', name: 'Access Control', why: 'صلاحيات الدخول حسب المركز' },
    { id: 'tblnNGiaKccMSpizT', name: 'Daily Sessions', why: 'جلسات موثّقة' },
    { id: 'tblkuCfFaopSsOKOG', name: 'Session Periods', why: 'جدول الحصص اليومي' },
    { id: 'tbl1oGzt0E5jYNA5e', name: 'Attendance Ledger', why: 'حضور معتمد' },
    { id: 'tblnZC5LIbRWze6T9', name: 'Goal Evidence', why: 'أدلة تحقق الأهداف' },
    { id: 'tblpxTavOza4SAjlH', name: 'Attendance Corrections', why: 'طلبات تصحيح الحضور' },
  ],
  archiveLater: [
    { id: 'appaGfKj4vYhMw0cb', name: 'LEGACY_BASE', why: 'القاعدة القديمة المزدحمة — أرشيف فقط' },
  ],
  noteAr:
    'القاعدة المركزية الجديدة appcjitgWsbvIebwf. كل صف تشغيلي مربوط بـ center_code. الخاص = فترتان، الحكومي = فترة واحدة.',
};
