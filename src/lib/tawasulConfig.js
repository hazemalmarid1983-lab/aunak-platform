/**
 * Tawasul sovereign lab — neural empire sandbox (base app3vCT2j2JepNVZa).
 * Enable with VITE_TAWASUL_MVP=true or VITE_AIRTABLE_BASE_ID=app3vCT2j2JepNVZa at build time.
 */

export const TAWASUL_BRANCH = 'Tawasul_MVP';

/** Live Tawasul sandbox base (separate from sovereign production appaGfKj4vYhMw0cb). */
export const TAWASUL_BASE_ID = 'app3vCT2j2JepNVZa';

/** Sovereign production Airtable base — government / Core deployment. */
export const SOVEREIGN_BASE_ID = 'appaGfKj4vYhMw0cb';

/** True when build targets sovereign production (not Tawasul sandbox). */
export function isSovereignProductionBuild() {
  const base = String(import.meta.env.VITE_AIRTABLE_BASE_ID ?? '').trim();
  return !base || base === SOVEREIGN_BASE_ID;
}

export function isTawasulSpecialistToken(token) {
  return /^AUN-SPC-/i.test(String(token ?? '').trim());
}

export function isTawasulMvp() {
  if (import.meta.env.VITE_TAWASUL_MVP === 'true') return true;
  const base = String(import.meta.env.VITE_AIRTABLE_BASE_ID ?? '').trim();
  return base === TAWASUL_BASE_ID;
}

/** Runtime path — always available even when sovereign build flag is off. */
export function isTawasulRoute() {
  if (typeof window === 'undefined') return false;
  const path = (window.location.pathname || '/').replace(/\/$/, '') || '/';
  return path === '/tawasul' || path.startsWith('/tawasul/');
}

/** Child interactive route (/child?token=AUN-CHD-…) — the student interface surface. */
export function isTawasulChildRoute() {
  if (typeof window === 'undefined') return false;
  const path = (window.location.pathname || '/').replace(/\/$/, '') || '/';
  return path === '/child' || path.startsWith('/child/');
}

/**
 * Full sovereign experience unlock — build flag, /tawasul route, or /child route.
 * Runtime-driven so every Aunak sovereign feature (Ghost Mirror, sovereign island,
 * audio, assessment) is open inside Tawasul even when the build-time flag is off.
 */
export function isTawasulExperience() {
  return isTawasulMvp() || isTawasulRoute() || isTawasulChildRoute();
}

/**
 * Specialist Tawasul shell — never hijacks sovereign production root (/).
 * - aunak.vercel.app/ → Aunak Gate (Core)
 * - aunak.vercel.app/tawasul → Tawasul specialist gate
 * - Tawasul-only preview (sandbox base) may still use / when VITE_TAWASUL_MVP=true
 */
export function shouldShowTawasulShell() {
  if (isTawasulRoute()) return true;
  if (isTawasulMvp() && !isSovereignProductionBuild()) return true;
  return false;
}

/** Max caseload per specialist in sovereign sandbox. */
export const TAWASUL_MAX_CASES_PER_SPECIALIST = 5;

/** Total student slots in sovereign lab base. */
export const TAWASUL_MAX_STUDENTS = 10;

export const TAWASUL_COPY = {
  ar: {
    platform: 'عونك · تواصل',
    tagline: 'إمبراطورية عصبية — سيادة كاملة',
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
    platform: 'Aunak · Tawasul',
    tagline: 'Neural empire — full sovereignty',
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
