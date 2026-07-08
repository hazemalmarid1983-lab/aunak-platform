/**
 * Zero Point Report — 66 clinical field schema (flat Students.zero_point_report JSON).
 * Domains: CARS-2 (15) · GARS-3 (14) · VB-MAPP (27) · Meta (10) = 66 fields.
 */

import { SESSION_FIELD_COUNT } from './sovereignProtocol';
import { COMPREHENSIVE_ASSESSMENT } from './tripleAccessProtocol';
import { STUDENT as SF } from './airtableFields';

export const ZERO_POINT_SCHEMA_VERSION = '1.0';
export const ZERO_POINT_FIELD_COUNT = SESSION_FIELD_COUNT;

function scoreField(id, scale, domain, labelEn, labelAr) {
  return { id, scale, domain, type: 'score_0_4', labelEn, labelAr };
}

/** Canonical 66-field registry — single source for Diagnostics UI + Airtable payload. */
export const ZERO_POINT_FIELDS = [
  ...Array.from({ length: 15 }, (_, i) =>
    scoreField(
      `cars_${String(i + 1).padStart(2, '0')}`,
      'CARS-2',
      'autism_severity',
      `CARS-2 item ${i + 1}`,
      `CARS-2 بند ${i + 1}`
    )
  ),
  ...Array.from({ length: 14 }, (_, i) =>
    scoreField(
      `gars_${String(i + 1).padStart(2, '0')}`,
      'GARS-3',
      'autism_risk',
      `GARS-3 item ${i + 1}`,
      `GARS-3 بند ${i + 1}`
    )
  ),
  ...Array.from({ length: 27 }, (_, i) =>
    scoreField(
      `vbmapp_${String(i + 1).padStart(2, '0')}`,
      'VB-MAPP',
      'developmental_milestone',
      `VB-MAPP milestone ${i + 1}`,
      `VB-MAPP معلم ${i + 1}`
    )
  ),
  { id: 'meta_assessor', scale: 'META', domain: 'admin', type: 'text', labelEn: 'Assessor name', labelAr: 'اسم المقيّم' },
  { id: 'meta_assessment_date', scale: 'META', domain: 'admin', type: 'date', labelEn: 'Assessment date', labelAr: 'تاريخ التقييم' },
  { id: 'meta_primary_scale', scale: 'META', domain: 'admin', type: 'text', labelEn: 'Primary scale', labelAr: 'المقياس الرئيسي' },
  { id: 'meta_raw_notes', scale: 'META', domain: 'clinical', type: 'text', labelEn: 'Raw clinical notes', labelAr: 'ملاحظات سريرية خام' },
  { id: 'meta_final_score', scale: 'META', domain: 'clinical', type: 'number', labelEn: 'Final composite score', labelAr: 'النتيجة المركبة' },
  { id: 'meta_severity_band', scale: 'META', domain: 'clinical', type: 'text', labelEn: 'Severity band', labelAr: 'شريحة الشدة' },
  { id: 'meta_communication_index', scale: 'META', domain: 'clinical', type: 'number', labelEn: 'Communication index', labelAr: 'مؤشر التواصل' },
  { id: 'meta_social_index', scale: 'META', domain: 'clinical', type: 'number', labelEn: 'Social index', labelAr: 'مؤشر اجتماعي' },
  { id: 'meta_behavior_index', scale: 'META', domain: 'clinical', type: 'number', labelEn: 'Behavior index', labelAr: 'مؤشر سلوكي' },
  { id: 'meta_recommendation', scale: 'META', domain: 'clinical', type: 'text', labelEn: 'Clinical recommendation', labelAr: 'توصية سريرية' },
];

if (ZERO_POINT_FIELDS.length !== ZERO_POINT_FIELD_COUNT) {
  console.warn(
    `[zeroPointSchema] field count ${ZERO_POINT_FIELDS.length} !== ${ZERO_POINT_FIELD_COUNT}`
  );
}

export function fieldsForScale(scale) {
  return ZERO_POINT_FIELDS.filter((f) => f.scale === scale);
}

/** Ensure all 66 schema keys exist in the clinical payload (flat Students JSON). */
export function ensureFullFieldMap(partial = {}) {
  const out = { ...partial };
  for (const def of ZERO_POINT_FIELDS) {
    if (out[def.id] === undefined) out[def.id] = null;
  }
  return out;
}

/** Merge prior zero_point_report fields when updating one scale (no sub-tables). */
export function mergePriorFieldValues(existingReport, nextValues = {}) {
  const prior = existingReport?.fields ?? {};
  return ensureFullFieldMap({ ...prior, ...nextValues });
}

function clampScore(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(4, Math.round(n)));
}

/**
 * Build zero_point_report JSON from Diagnostics form state.
 * @param {{ activeScale, rawNotes, finalScore, assessor, fieldValues? }} input
 */
export function buildZeroPointReport(input = {}) {
  const activeScale = String(input.activeScale ?? 'CARS-2');
  const assessedAt = new Date().toISOString();
  const fieldValues = mergePriorFieldValues(input.existingReport, input.fieldValues ?? {});

  fieldValues.meta_assessor = String(input.assessor ?? '').trim() || null;
  fieldValues.meta_assessment_date = assessedAt.slice(0, 10);
  fieldValues.meta_primary_scale = activeScale;
  fieldValues.meta_raw_notes = String(input.rawNotes ?? '').trim() || null;
  fieldValues.meta_final_score =
    input.finalScore != null && Number.isFinite(Number(input.finalScore))
      ? Number(input.finalScore)
      : null;

  const scaleScores = fieldsForScale(activeScale)
    .filter((f) => f.type === 'score_0_4')
    .map((f) => clampScore(fieldValues[f.id]))
    .filter((v) => v != null);
  const composite =
    fieldValues.meta_final_score ??
    (scaleScores.length > 0
      ? Math.round((scaleScores.reduce((a, b) => a + b, 0) / scaleScores.length) * 25)
      : null);

  fieldValues.meta_communication_index = composite;
  fieldValues.meta_social_index = composite != null ? Math.max(0, composite - 5) : null;
  fieldValues.meta_behavior_index = composite != null ? Math.max(0, 100 - composite) : null;
  fieldValues.meta_severity_band =
    composite == null
      ? null
      : composite >= 75
        ? 'mild'
        : composite >= 50
          ? 'moderate'
          : 'support_intensive';

  const programmedGoal = extractProgrammedGoal({
    composite,
    active_scale: activeScale,
    fields: fieldValues,
  });

  fieldValues.meta_recommendation = programmedGoal;

  const fullFields = ensureFullFieldMap(fieldValues);

  return {
    schema_version: ZERO_POINT_SCHEMA_VERSION,
    field_count: ZERO_POINT_FIELD_COUNT,
    assessed_at: assessedAt,
    active_scale: activeScale,
    fields: fullFields,
    composite_score: composite,
    programmed_goal_suggestion: programmedGoal,
  };
}

/** Derive programmed_goal from weakest domain / scale profile. */
export function extractProgrammedGoal(report) {
  const composite = report?.composite_score ?? report?.fields?.meta_final_score;
  const scale = report?.active_scale ?? report?.fields?.meta_primary_scale ?? 'CARS-2';

  if (scale === 'VB-MAPP') {
    return 'Increase manding and tacting — 3 novel requests per session with visual prompt fade.';
  }
  if (scale === 'GARS-3') {
    return 'Strengthen social reciprocity — joint attention game 5 minutes with peer or specialist.';
  }
  if (composite != null && composite < 50) {
    return 'Build functional communication — picture exchange or single-word request for preferred item.';
  }
  if (composite != null && composite < 75) {
    return 'Expand expressive language — two-word phrase with modeling and natural reinforcement.';
  }
  return 'Maintain gains — generalize mastered targets across home and clinic settings.';
}

export function serializeZeroPointReport(report) {
  return JSON.stringify(report, null, 0);
}

export function parseZeroPointReport(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'object') return raw;
  try {
    return JSON.parse(String(raw));
  } catch {
    return null;
  }
}

/** Map zero point report → flat Students table PATCH (single write, no sub-table). */
export function zeroPointAirtableFields(report) {
  const blob = serializeZeroPointReport(report);
  const goal = report?.programmed_goal_suggestion ?? extractProgrammedGoal(report);
  return {
    [SF.zero_point_report]: blob,
    [SF.comprehensive_assessment_status]: COMPREHENSIVE_ASSESSMENT.completed,
    [SF.smart_session_fields]: ZERO_POINT_FIELD_COUNT,
    [SF.programmed_goal]: goal,
  };
}

export async function saveZeroPointReport(recordId, formInput, updateStudentRecord) {
  if (!recordId || typeof updateStudentRecord !== 'function') {
    throw new Error('STUDENT_ID_REQUIRED');
  }
  const report = buildZeroPointReport(formInput);
  const fields = zeroPointAirtableFields(report);
  await updateStudentRecord(recordId, fields);
  return report;
}
