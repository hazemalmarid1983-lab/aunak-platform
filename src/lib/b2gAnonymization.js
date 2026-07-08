/**
 * B2G Anonymization — shared view mapping (client display + server filter contract).
 * HMAC pseudonym CHD-XXXX uses first 4 hex chars of SHA-256 HMAC(recordId, B2G_HMAC_SALT).
 * Server-side HMAC runs in api/_handlers/b2g/anonymize.js (salt never in browser bundle).
 */

import { STUDENT as SF, DAILY_SESSION as DS } from './airtableFields';

export const B2G_ROLE = 'ministry_auditor';

const PII_FIELD_KEYS = new Set([
  SF.name,
  SF.parent_phone,
  SF.parent_country_code,
  SF.face_biometric,
  SF.parent_access_token,
  SF.child_interactive_token,
  SF.specialist_tutor_token,
  SF.student_english_token,
  SF.eye_movement_map,
  'student_name',
  'parent_phone',
  'parent_country_code',
  'face_biometric',
  'parent_access_token',
  'child_interactive_token',
  'specialist_tutor_token',
  'student_english_token',
  'location',
  'address',
  'photo',
  'attachment',
]);

const PII_KEY_PATTERN =
  /name|phone|email|biometric|token|face|photo|صورة|وجه|ولي|parent|guardian|هاتف|اسم|رمز|attachment|مرفق|location|address|map/i;

/** Clinical / compliance metrics retained for auditors. */
export const B2G_ALLOWED_STUDENT_KEYS = new Set([
  SF.harmony_score,
  SF.academic_progress,
  SF.behavior_intensity,
  SF.focus_level,
  SF.improvement_index,
  SF.operating_efficiency,
  SF.payment_status,
  SF.session_fee,
  SF.initial_assessment_score,
  SF.smart_session_fields,
  SF.status,
  SF.diagnosis,
  SF.age,
  SF.clinical_session_status,
  SF.comprehensive_assessment_status,
  SF.claim_status,
  'harmony_score',
  'academic_progress',
  'behavior_intensity',
  'focus_level',
  'improvement_index',
  'operating_efficiency',
  'payment_status',
  'session_fee',
  'claim_status',
  'comprehensive_assessment_status',
  'initial_assessment_score',
  'smart_session_fields',
  'status',
  'diagnosis',
  'age',
  'clinical_session_status',
]);

const SESSION_PII_KEYS = new Set([
  DS.student_name,
  DS.specialist_name,
  DS.specialist_signature,
  'student_name',
  'specialist_name',
  'specialist_signature',
]);

const SESSION_ALLOWED_KEYS = new Set([
  DS.session_date,
  DS.claim_status,
  DS.sealed_at,
  DS.immutable_hash,
  DS.session_sequence,
  DS.pin_verified,
  DS.notes,
  'session_date',
  'claim_status',
  'sealed_at',
  'immutable_hash',
  'session_sequence',
  'pin_verified',
  'notes',
]);

/** Format HMAC hex digest → CHD-A3F2 (deterministic, uppercase). */
export function formatB2GChildCode(hexDigest) {
  const hex = String(hexDigest ?? '00000000').replace(/[^a-f0-9]/gi, '');
  return `CHD-${hex.slice(0, 4).toUpperCase() || '0000'}`;
}

function num(value) {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/** Risk 0–100 from behavior intensity + inverse harmony/focus. */
export function calculateB2GRiskScore(fields = {}) {
  const behavior = num(fields[SF.behavior_intensity] ?? fields.behavior_intensity) ?? 0;
  const harmony = num(fields[SF.harmony_score] ?? fields.harmony_score) ?? 50;
  const focus = num(fields[SF.focus_level] ?? fields.focus_level) ?? 50;
  const raw = behavior * 0.4 + (100 - harmony) * 0.35 + (100 - focus) * 0.25;
  return Math.round(Math.min(100, Math.max(0, raw)));
}

function pickAllowedFields(fields, allowedSet) {
  const safe = {};
  if (!fields || typeof fields !== 'object') return safe;
  for (const [key, value] of Object.entries(fields)) {
    if (PII_FIELD_KEYS.has(key) || PII_KEY_PATTERN.test(key)) continue;
    if (allowedSet.has(key)) safe[key] = value;
  }
  return safe;
}

/** Map one student row → ministry audit view (no PII). */
export function mapStudentToB2GView(student) {
  const fields = student?.fields ?? student ?? {};
  const recordId = student?.id ?? student?.recordId ?? null;
  const b2gCode =
    fields.b2g_child_code ??
    student?.b2gCode ??
    (String(recordId ?? '').startsWith('CHD-') ? recordId : null) ??
    'CHD-0000';

  const safeFields = pickAllowedFields(fields, B2G_ALLOWED_STUDENT_KEYS);
  const focusLevel = num(safeFields[SF.focus_level] ?? safeFields.focus_level);
  const harmonyScore = num(safeFields[SF.harmony_score] ?? safeFields.harmony_score);

  return {
    id: b2gCode,
    b2gCode,
    recordRef: recordId && !String(recordId).startsWith('CHD-') ? recordId : undefined,
    focusLevel,
    harmonyScore,
    riskScore: calculateB2GRiskScore(safeFields),
    academicProgress: num(safeFields[SF.academic_progress] ?? safeFields.academic_progress),
    behaviorIntensity: num(safeFields[SF.behavior_intensity] ?? safeFields.behavior_intensity),
    status: safeFields[SF.status] ?? safeFields.status ?? '—',
    diagnosis: safeFields[SF.diagnosis] ?? safeFields.diagnosis ?? '—',
    clinicalSessionStatus:
      String(safeFields[SF.clinical_session_status] ?? safeFields.clinical_session_status ?? '').toLowerCase(),
    comprehensiveAssessmentStatus:
      safeFields[SF.comprehensive_assessment_status] ?? safeFields.comprehensive_assessment_status,
    isLiveSession: /live|active|جلسة/i.test(
      String(safeFields[SF.clinical_session_status] ?? safeFields.clinical_session_status ?? '')
    ),
    fields: safeFields,
    _b2g_anonymized: true,
  };
}

function isSessionSealed(fields) {
  const st = String(fields[DS.claim_status] ?? fields.claim_status ?? '').toLowerCase();
  return st === 'sealed' || Boolean(fields[DS.sealed_at] ?? fields.sealed_at);
}

/** Map daily session row → compliance audit view (names stripped). */
export function mapSessionToB2GView(session) {
  const fields = session?.fields ?? session ?? {};
  const safe = {};
  for (const [key, value] of Object.entries(fields)) {
    if (SESSION_PII_KEYS.has(key)) continue;
    if (/name|phone|email|signature|token|biometric/i.test(key)) continue;
    if (SESSION_ALLOWED_KEYS.has(key)) safe[key] = value;
  }
  const notes = String(safe[DS.notes] ?? safe.notes ?? '');
  const redactedNotes = notes.replace(/[\w\u0600-\u06FF]{2,}/g, '[redacted]');

  return {
    id: session?.id ?? `ses-${safe[DS.session_sequence] ?? '?'}`,
    sessionDate: safe[DS.session_date] ?? safe.session_date ?? '—',
    claimStatus: safe[DS.claim_status] ?? safe.claim_status ?? 'open',
    sealed: isSessionSealed(safe),
    sessionSequence: safe[DS.session_sequence] ?? safe.session_sequence,
    immutableHash: safe[DS.immutable_hash] ?? safe.immutable_hash,
    pinVerified: safe[DS.pin_verified] ?? safe.pin_verified,
    notes: redactedNotes.slice(0, 120),
    _b2g_anonymized: true,
  };
}

export function isB2GRole(role) {
  const r = String(role ?? '').trim().toLowerCase();
  return r === B2G_ROLE || r.includes('ministry') || r.includes('b2g');
}

/** Compliance % — sealed sessions / total (0–100). */
export function computeCompliancePercent(sessions = []) {
  const list = Array.isArray(sessions) ? sessions : [];
  if (!list.length) return 100;
  const sealed = list.filter((s) => s.sealed || isSessionSealed(s.fields ?? s)).length;
  return Math.round((sealed / list.length) * 100);
}

/** Strip PII from raw Airtable student record; identity → b2gCode via injected hasher. */
export function anonymizeStudentRecord(record, b2gCodeFromId) {
  if (!record || typeof record !== 'object') return record;
  const code =
    typeof b2gCodeFromId === 'function'
      ? b2gCodeFromId(record.id)
      : formatB2GChildCode('0000');
  const mapped = mapStudentToB2GView({ ...record, fields: { ...record.fields, b2g_child_code: code } });
  return {
    id: mapped.b2gCode,
    _b2g_anonymized: true,
    fields: { ...mapped.fields, b2g_child_code: mapped.b2gCode },
  };
}

export function filterStudentsForB2G(body, b2gCodeFromId) {
  if (body == null) return body;
  if (Array.isArray(body.records)) {
    return { ...body, records: body.records.map((r) => anonymizeStudentRecord(r, b2gCodeFromId)) };
  }
  if (body.id && body.fields) {
    return anonymizeStudentRecord(body, b2gCodeFromId);
  }
  return body;
}

export function filterSessionsForB2G(body) {
  if (body == null) return body;
  const toRecord = (r) => {
    const view = mapSessionToB2GView(r);
    return {
      id: r.id,
      _b2g_anonymized: true,
      fields: {
        [DS.session_date]: view.sessionDate,
        [DS.claim_status]: view.claimStatus,
        [DS.session_sequence]: view.sessionSequence,
        [DS.immutable_hash]: view.immutableHash,
        [DS.pin_verified]: view.pinVerified,
        [DS.notes]: view.notes,
        b2g_sealed: view.sealed,
      },
    };
  };
  if (Array.isArray(body.records)) {
    return { ...body, records: body.records.map(toRecord) };
  }
  if (body.id && body.fields) {
    return toRecord(body);
  }
  return body;
}
