/**
 * Tawasul MVP — isolated mini-platform (branch Tawasul_MVP / production lab base).
 * Enable with VITE_TAWASUL_MVP=true or VITE_AIRTABLE_BASE_ID=app3vCT2j2JepNVZa at build time.
 */

export const TAWASUL_BRANCH = 'Tawasul_MVP';

/** Live Tawasul sandbox base (separate from sovereign production appaGfKj4vYhMw0cb). */
export const TAWASUL_BASE_ID = 'app3vCT2j2JepNVZa';

export function isTawasulSpecialistToken(token) {
  return /^AUN-SPC-/i.test(String(token ?? '').trim());
}

export function isTawasulMvp() {
  if (import.meta.env.VITE_TAWASUL_MVP === 'true') return true;
  const base = String(import.meta.env.VITE_AIRTABLE_BASE_ID ?? '').trim();
  return base === TAWASUL_BASE_ID;
}

/** Max caseload per specialist in MVP sandbox. */
export const TAWASUL_MAX_CASES_PER_SPECIALIST = 5;

/** Total student slots in MVP base. */
export const TAWASUL_MAX_STUDENTS = 10;

export const TAWASUL_COPY = {
  ar: {
    platform: 'منصة تواصل',
    tagline: 'MVP — بيئة عزل برمي مستقلة',
    specialistGate: 'دخول الأخصائي',
    tokenHint: 'أدخل رمز الأخصائي (specialist_tutor_token)',
    tokenInvalid: 'رمز غير صالح — تحقق من جدول الأخصائيين',
    myCases: 'حالاتي',
    dailyGoal: 'الهدف اليومي',
    saveGoal: 'حفظ الهدف',
    sessionsToday: 'جلسات مقفلة اليوم',
    childLink: 'رابط الطفل',
    logout: 'خروج',
  },
  en: {
    platform: 'Tawasul Platform',
    tagline: 'MVP — isolated sandbox',
    specialistGate: 'Specialist login',
    tokenHint: 'Enter specialist_tutor_token',
    tokenInvalid: 'Invalid token — check Specialists table',
    myCases: 'My cases',
    dailyGoal: 'Daily goal',
    saveGoal: 'Save goal',
    sessionsToday: 'Sealed sessions today',
    childLink: 'Child link',
    logout: 'Logout',
  },
};
