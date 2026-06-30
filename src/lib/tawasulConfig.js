/**
 * Tawasul MVP — isolated mini-platform (branch Tawasul_MVP).
 * Enable with VITE_TAWASUL_MVP=true on Vercel Preview for this branch only.
 */

export const TAWASUL_BRANCH = 'Tawasul_MVP';

export function isTawasulMvp() {
  return import.meta.env.VITE_TAWASUL_MVP === 'true';
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
