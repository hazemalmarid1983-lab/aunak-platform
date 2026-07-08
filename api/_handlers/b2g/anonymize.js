/**
 * B2G Anonymization — server-only PII strip + stable CHD pseudonym (HMAC).
 * Ministry auditors see growth/compliance metrics only — never real names or biometrics.
 */

import { createHmac } from 'crypto';
import { STUDENT as SF } from '../../../src/lib/airtableFields.js';

export const B2G_ROLE = 'ministry_auditor';

/** Fields always removed for B2G responses. */
const PII_FIELD_KEYS = new Set([
  SF.name,
  SF.parent_phone,
  SF.parent_country_code,
  SF.face_biometric,
  SF.parent_access_token,
  SF.child_interactive_token,
  SF.specialist_tutor_token,
  SF.student_english_token,
  'student_name',
  'parent_phone',
  'face_biometric',
  'parent_access_token',
  'child_interactive_token',
  'specialist_tutor_token',
  'student_english_token',
]);

const PII_KEY_PATTERN =
  /name|phone|email|biometric|token|face|photo|صورة|وجه|ولي|parent|guardian|هاتف|اسم|رمز|token|attachment|مرفق/i;

/** Metrics ministry auditors may view (flat Students table — no sub-tables). */
const B2G_ALLOWED_KEYS = new Set([
  SF.harmony_score,
  SF.academic_progress,
  SF.behavior_intensity,
  SF.improvement_index,
  SF.operating_efficiency,
  SF.payment_status,
  SF.session_fee,
  SF.initial_assessment_score,
  SF.pronunciation_accuracy,
  SF.smart_session_fields,
  SF.status,
  SF.diagnosis,
  SF.age,
  'harmony_score',
  'academic_progress',
  'behavior_intensity',
  'improvement_index',
  'operating_efficiency',
  'payment_status',
  'session_fee',
  'claim_status',
  'comprehensive_assessment_status',
  'initial_assessment_score',
  'pronunciation_accuracy',
  'smart_session_fields',
  'status',
  'diagnosis',
  'age',
]);

function resolveB2GSalt() {
  return (
    process.env.B2G_HMAC_SALT ||
    process.env.AIRTABLE_API_KEY?.slice(0, 16) ||
    'aunak-b2g-sovereign-salt'
  );
}

/** Stable pseudonym CHD-9832 style from Airtable record id. */
export function b2gChildCode(recordId) {
  const rec = String(recordId ?? '').trim();
  if (!rec) return 'CHD-0000';
  const digest = createHmac('sha256', resolveB2GSalt()).update(rec).digest('hex');
  const num = (parseInt(digest.slice(0, 8), 16) % 9000) + 1000;
  return `CHD-${num}`;
}

function fieldAllowed(key) {
  if (PII_FIELD_KEYS.has(key)) return false;
  if (PII_KEY_PATTERN.test(key)) return false;
  if (B2G_ALLOWED_KEYS.has(key)) return true;
  return false;
}

/** Strip PII from one Airtable record; replace identity with b2g_child_code. */
export function anonymizeStudentRecord(record) {
  if (!record || typeof record !== 'object') return record;
  const fields = record.fields ?? {};
  const safe = {};
  for (const [key, value] of Object.entries(fields)) {
    if (fieldAllowed(key)) safe[key] = value;
  }
  safe.b2g_child_code = b2gChildCode(record.id);
  return {
    id: b2gChildCode(record.id),
    _b2g_anonymized: true,
    fields: safe,
  };
}

/** Apply B2G filter to proxy JSON (list or single record). */
export function filterAirtableResponseForB2G(body, { studentsTableHint = false } = {}) {
  if (!studentsTableHint || body == null) return body;
  if (Array.isArray(body.records)) {
    return { ...body, records: body.records.map(anonymizeStudentRecord) };
  }
  if (body.id && body.fields) {
    return anonymizeStudentRecord(body);
  }
  return body;
}

export function isB2GRole(role) {
  const r = String(role ?? '').trim().toLowerCase();
  return r === B2G_ROLE || r.includes('ministry') || r.includes('b2g');
}
