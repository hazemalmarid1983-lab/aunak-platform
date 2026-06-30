import { fetchAirtableRecords, getField } from './airtable';
import { AIRTABLE_TABLES } from './airtableTables';
import { SPECIALIST as SP, STUDENT as SF } from './airtableFields';
import { ROLES } from './auth';
import { PLAN_CODES } from './plans';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

/** Resolve specialist row by specialist_tutor_token (AUN-SPC-...). */
export async function findSpecialistByToken(token) {
  const key = normalizeToken(token);
  if (!key || !key.startsWith('AUN-SPC-')) return null;

  const rows = await fetchAirtableRecords(AIRTABLE_TABLES.specialists);
  return (
    rows.find((r) => normalizeToken(getField(r.fields, SP.specialist_tutor_token)) === key) ||
    rows.find((r) => normalizeToken(getField(r.fields, SF.specialist_tutor_token)) === key) ||
    null
  );
}

/** Build auth session for Tawasul MVP specialist gate. */
export async function verifyTawasulSpecialistToken(inputToken) {
  const record = await findSpecialistByToken(inputToken);
  if (!record) return null;

  const f = record.fields ?? {};
  const status = String(getField(f, SP.status) ?? 'active').toLowerCase();
  if (/inactive|disabled|معطل/.test(status)) return null;

  const name = getField(f, SP.name) || getField(f, 'Name') || 'أخصائي';
  const email = getField(f, SP.email) || '';

  return {
    role: ROLES.SPECIALIST,
    plan: PLAN_CODES.TUTOR,
    name,
    email,
    specialistRecordId: record.id,
    specialistToken: normalizeToken(inputToken),
    tawasulMvp: true,
    landingSection: 'registry',
    dynamicSessionId: `TWS-${Date.now().toString(36)}`,
  };
}
