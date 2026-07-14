/**
 * Sovereign enrollment funnel — resumable state machine + assessment bypass.
 * Server and client share the same phase resolver.
 */

export const FUNNEL_PHASES = {
  DATA: 'data',
  ASSESSMENT: 'assessment',
  ACTIVATION: 'activation',
  BIOMETRIC: 'biometric',
  ISLANDS: 'islands',
  CLASSROOMS: 'classrooms',
  COMPLETE: 'complete',
};

function norm(v) {
  return String(v ?? '').trim().toLowerCase();
}

export function hasFaceBiometric(fields = {}) {
  const face = fields.face_biometric ?? fields.Face_Biometric ?? '';
  const status = norm(fields.biometric_status ?? fields.Biometric_Status);
  return Boolean(String(face).trim()) || status === 'approved';
}

export function isSubscriptionActiveStatus(raw) {
  const s = norm(raw);
  return (
    s === 'active' ||
    s === 'نشط' ||
    s === 'مفعل' ||
    s === 'فعال' ||
    s === 'b2b_premium' ||
    s.includes('premium')
  );
}

export function isComprehensiveCompleted(raw) {
  return norm(raw) === 'completed';
}

/**
 * Resolve next funnel phase from Airtable student fields.
 * Protocol V1: active + biometric → landingSection live (no island-games bypass).
 */
export function resolveFunnelPhase(fields = {}) {
  const subscription = fields.subscription_status ?? fields.Subscription_Status;
  const comprehensive =
    fields.comprehensive_assessment_status ?? fields.Comprehensive_Assessment_Status;
  const score = fields.initial_assessment_score ?? fields.Initial_Assessment_Score;
  const landing = norm(
    fields.preferred_destination ?? fields.Preferred_Destination ?? 'live'
  );
  const active = isSubscriptionActiveStatus(subscription);
  const completed = isComprehensiveCompleted(comprehensive);
  const hasScore = score != null && String(score).trim() !== '';
  const biometric = hasFaceBiometric(fields);
  if (active && completed && biometric) {
    return {
      phase: FUNNEL_PHASES.COMPLETE,
      bypassAssessment: true,
      landingSection: 'live',
      reason: 'SOVEREIGN_LIVE_PASSAGE',
    };
  }

  if (active && completed && !biometric) {
    return {
      phase: FUNNEL_PHASES.BIOMETRIC,
      bypassAssessment: true,
      landingSection: 'live',
      reason: 'COMPREHENSIVE_NEEDS_BIOMETRIC',
    };
  }

  if (active && !biometric) {
    return {
      phase: FUNNEL_PHASES.BIOMETRIC,
      bypassAssessment: false,
      landingSection: 'live',
      reason: 'ACTIVE_NEEDS_BIOMETRIC',
    };
  }

  if (active && biometric) {
    return {
      phase: FUNNEL_PHASES.COMPLETE,
      bypassAssessment: completed,
      landingSection: 'live',
      reason: 'ACTIVE_WITH_BIOMETRIC',
    };
  }

  // Pending / new — resumable
  if (!hasScore) {
    return {
      phase: FUNNEL_PHASES.ASSESSMENT,
      bypassAssessment: false,
      landingSection: landing || 'live',
      reason: 'NEEDS_SCREENING',
    };
  }

  return {
    phase: FUNNEL_PHASES.ACTIVATION,
    bypassAssessment: false,
    landingSection: landing || 'live',
    reason: 'NEEDS_LICENSE_ACTIVATION',
  };
}

/** Escape Airtable formula string literals. */
export function escapeAirtableFormula(value) {
  return String(value ?? '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

/**
 * Composite Primary Key: national_id + English student_name.
 * Lookup still keys on national_id; name mismatch → 422 at API layer.
 */
export function buildIdentityLookupFormula(nationalId, studentName) {
  const nid = escapeAirtableFormula(normalizeNationalId(nationalId));
  const name = escapeAirtableFormula(normalizeEnglishStudentName(studentName));
  if (!nid) return '';
  if (!name) return `{national_id}='${nid}'`;
  return `AND({national_id}='${nid}', LOWER({student_name})=LOWER('${name}'))`;
}

/** Compare English names for composite PK enforcement. */
export function englishNamesMatch(a, b) {
  return (
    normalizeEnglishStudentName(a).toLowerCase() ===
    normalizeEnglishStudentName(b).toLowerCase()
  );
}

/** Upsert key formula — national_id only. */
export function buildNationalIdLookupFormula(nationalId) {
  const nid = escapeAirtableFormula(normalizeNationalId(nationalId));
  if (!nid) return '';
  return `{national_id}='${nid}'`;
}

export function normalizeNationalId(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/\s+/g, '')
    .toUpperCase();
}

/** English student_name — letters, spaces, hyphen, apostrophe. */
export function normalizeEnglishStudentName(raw) {
  return String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function validateEnglishStudentName(raw, lang = 'ar') {
  const name = normalizeEnglishStudentName(raw);
  if (!name) {
    return {
      ok: false,
      message: lang === 'en' ? 'Enter English beneficiary name' : 'أدخل الاسم الإنجليزي للمستفيد',
    };
  }
  if (name.length < 3) {
    return {
      ok: false,
      message: lang === 'en' ? 'English name too short' : 'الاسم الإنجليزي قصير جداً',
    };
  }
  if (!/^[A-Za-z][A-Za-z\s'-]*[A-Za-z]$/.test(name) && !/^[A-Za-z]{2,}$/.test(name)) {
    return {
      ok: false,
      message:
        lang === 'en'
          ? 'English name: Latin letters only (e.g. Hussain Al Busaidi)'
          : 'الاسم الإنجليزي: حروف لاتينية فقط (مثال: Hussain Al Busaidi)',
    };
  }
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return {
      ok: false,
      message:
        lang === 'en'
          ? 'Enter at least first + family name in English'
          : 'أدخل الاسم الأول واللقب بالإنجليزية على الأقل',
    };
  }
  return { ok: true, value: name };
}

export function validateNationalId(raw, lang = 'ar') {
  const id = normalizeNationalId(raw);
  if (!id) {
    return {
      ok: false,
      message: lang === 'en' ? 'Enter national ID' : 'أدخل رقم الهوية الوطنية',
    };
  }
  if (!/^[A-Z0-9]{5,20}$/.test(id)) {
    return {
      ok: false,
      message:
        lang === 'en'
          ? 'National ID: 5–20 letters/digits'
          : 'رقم الهوية: 5–20 حرفاً أو رقماً',
    };
  }
  return { ok: true, value: id };
}
