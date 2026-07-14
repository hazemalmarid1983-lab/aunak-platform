/**
 * Value Lock System — المصفوفة الخماسية السيادية لمنصة عونك.
 *
 * Tiers (cumulative): free < tutor < medical < institution
 * Exception: assessment_only — باقة تقييم معزولة (diagnostics فقط).
 */

export const PLAN_CODES = {
  FREE: 'free',
  INSTITUTION: 'institution',
  TUTOR: 'tutor',
  MEDICAL: 'medical',
  ASSESSMENT_ONLY: 'assessment_only',
  /** @deprecated use INSTITUTION — kept for session migration */
  B2C: 'tutor',
  B2B: 'institution',
  B2G: 'institution',
};

const RANK = {
  free: 0,
  tutor: 1,
  medical: 2,
  institution: 3,
};

export function planRank(plan) {
  const p = normalizePlanCode(plan);
  if (p === PLAN_CODES.ASSESSMENT_ONLY) return -1;
  return RANK[p] ?? 0;
}

export function normalizePlanCode(plan) {
  const v = String(plan ?? '').trim().toLowerCase();
  if (v === 'b2c') return PLAN_CODES.TUTOR;
  if (v === 'b2b' || v === 'b2g') return PLAN_CODES.INSTITUTION;
  return v || PLAN_CODES.FREE;
}

/** Parse a raw 'كود الباقة' / subscription value into a canonical plan code. */
export function resolvePlanCode(raw) {
  const v = String(raw ?? '').trim().toLowerCase();
  if (!v) return null;
  if (/assessment[\s_-]?only|تقييم[\s_-]?فقط|تقييم[\s_-]?شامل/.test(v)) {
    return PLAN_CODES.ASSESSMENT_ONLY;
  }
  if (/institution|b2g|b2b|سياد|sovereign|gov|مراكز|مركز|center|وزار/.test(v)) {
    return PLAN_CODES.INSTITUTION;
  }
  if (/medical|طب|doctor|clinic|عياد|طبيب/.test(v)) {
    return PLAN_CODES.MEDICAL;
  }
  if (/tutor|b2c|مدرس|خصوص|منزل|أسرة|اسرة|عائل|family|home/.test(v)) {
    return PLAN_CODES.TUTOR;
  }
  if (/free|مجاني|community|مجتمع/.test(v)) return PLAN_CODES.FREE;
  return null;
}

/** Minimum plan required to open each section of the hub. */
export const SECTION_MIN_PLAN = {
  community: PLAN_CODES.FREE,
  resources: PLAN_CODES.FREE,
  media: PLAN_CODES.TUTOR,
  biometrics: PLAN_CODES.TUTOR,
  emotion: PLAN_CODES.TUTOR,
  learning: PLAN_CODES.TUTOR,
  classrooms: PLAN_CODES.TUTOR,
  diagnostics: PLAN_CODES.MEDICAL,
  crisis: PLAN_CODES.MEDICAL,
  live: PLAN_CODES.MEDICAL,
  scientific: PLAN_CODES.MEDICAL,
  registry: PLAN_CODES.INSTITUTION,
  governance: PLAN_CODES.TUTOR,
  assessmentProtocol: PLAN_CODES.TUTOR,
  behavior: PLAN_CODES.INSTITUTION,
  enrollment: PLAN_CODES.INSTITUTION,
  specialists: PLAN_CODES.INSTITUTION,
  research: PLAN_CODES.INSTITUTION,
  reports: PLAN_CODES.MEDICAL,
  access: PLAN_CODES.INSTITUTION,
  summerAcademy: PLAN_CODES.FREE,
};

const ASSESSMENT_ONLY_SECTIONS = new Set(['diagnostics', 'enrollment']);

export function planAllows(plan, sectionId) {
  const p = normalizePlanCode(plan);
  if (p === PLAN_CODES.ASSESSMENT_ONLY) {
    return ASSESSMENT_ONLY_SECTIONS.has(sectionId);
  }
  const min = SECTION_MIN_PLAN[sectionId] ?? PLAN_CODES.FREE;
  return planRank(p) >= planRank(min);
}

/** Institution-tier or higher — harmony scores & eye-tracking maps. */
export function isActiveB2B(plan) {
  const p = normalizePlanCode(plan);
  return p === PLAN_CODES.INSTITUTION || planRank(p) >= RANK.institution;
}

export function isActiveInstitution(plan) {
  return isActiveB2B(plan);
}

export const B2B_PREMIUM_TAG = 'B2B_PREMIUM';

export function hasB2BPremiumTag(rawStatus) {
  return /b2b[\s_-]?premium|institution[\s_-]?premium/i.test(String(rawStatus ?? ''));
}

export function resolveEnrollmentAccess(statusRaw) {
  const s = String(statusRaw ?? '').trim().toLowerCase();
  if (s === 'new' || s === 'جديد') {
    return { allowed: true, tier: 'new', plan: PLAN_CODES.FREE };
  }
  if (s === 'active' || s === 'نشط') {
    return { allowed: true, tier: 'active', plan: null };
  }
  if (s === 'pending' || s === 'معلق' || s === 'بانتظار') {
    return { allowed: true, tier: 'pending', plan: PLAN_CODES.FREE };
  }
  return { allowed: false, tier: 'blocked', plan: null };
}

export function resolvePlanFromStudentFields(fields, getFieldFn) {
  if (!fields || !getFieldFn) return PLAN_CODES.FREE;
  const raw =
    getFieldFn(fields, 'plan_code') ||
    getFieldFn(fields, 'subscription_status');
  return resolvePlanCode(raw) ?? PLAN_CODES.FREE;
}

/** Preferred landing section after activation by plan. */
export const PLAN_LANDING = {
  [PLAN_CODES.FREE]: 'community',
  [PLAN_CODES.TUTOR]: 'media',
  [PLAN_CODES.MEDICAL]: 'diagnostics',
  [PLAN_CODES.INSTITUTION]: 'registry',
  [PLAN_CODES.ASSESSMENT_ONLY]: 'diagnostics',
};

export function landingForPlan(plan) {
  const p = normalizePlanCode(plan);
  return PLAN_LANDING[p] ?? PLAN_LANDING[PLAN_CODES.FREE];
}

export const PLAN_LABELS = {
  ar: {
    free: 'منتدى الدعم الأسري',
    institution: 'المراكز والوزارات',
    tutor: 'ممارس تحليل السلوك التطبيقي المعتمد',
    medical: 'الأطباء والعيادات',
    assessment_only: 'رخصة مقياس المسح النمائي الشامل',
  },
  en: {
    free: 'Family Support Forum',
    institution: 'Centers & Ministries',
    tutor: 'Board-Certified Behavior Analyst (ABA)',
    medical: 'Doctors & Clinics',
    assessment_only: 'Developmental Screening Matrix License',
  },
};
