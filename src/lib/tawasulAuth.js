import { fetchAirtableRecords, getField } from './airtable';
import { AIRTABLE_TABLES } from './airtableTables';
import { SPECIALIST as SP, STUDENT as SF } from './airtableFields';
import { ROLES } from './auth';
import { PLAN_CODES } from './plans';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

function buildSessionFromRecord(record, inputToken) {
  const f = record.fields ?? {};
  const status = String(getField(f, SP.status) ?? 'active').toLowerCase();
  if (/inactive|disabled|معطل/.test(status)) return null;

  const name = getField(f, SP.name) || getField(f, 'Name') || 'أخصائي';
  const email = getField(f, SP.email) || getField(f, 'Email') || '';

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

/** Resolve specialist row by specialist_tutor_token (AUN-SPC-...) — local/dev fallback. */
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

async function verifyViaServer(inputToken) {
  const res = await fetch('/api/tawasul/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token: inputToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data?.session) return data.session;
  if (res.status === 401 || res.status === 403) return null;
  throw new Error(data?.error || `VERIFY_${res.status}`);
}

/** Build auth session for Tawasul MVP specialist gate. */
export async function verifyTawasulSpecialistToken(inputToken) {
  const key = normalizeToken(inputToken);
  if (!key.startsWith('AUN-SPC-')) return null;

  try {
    return await verifyViaServer(inputToken);
  } catch (serverErr) {
    if (import.meta.env.PROD) {
      console.error('[tawasulAuth] server verify failed:', serverErr?.message);
      return null;
    }
    const record = await findSpecialistByToken(inputToken);
    if (!record) return null;
    return buildSessionFromRecord(record, inputToken);
  }
}
