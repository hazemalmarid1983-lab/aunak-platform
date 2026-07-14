import { fetchStudents, getField } from './airtable';
import { mapStudent } from './airtableMappers';
import { STUDENT as SF } from './airtableFields';
import { isSubscriptionActive } from './auth';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

/** Record is usable for /child when subscription or status is active / premium. */
export function isChildPortalActivated(studentOrFields) {
  const fields = studentOrFields?.fields ?? studentOrFields ?? {};
  const status = String(getField(fields, SF.status) ?? studentOrFields?.status ?? '').toLowerCase();
  const subscription = String(
    getField(fields, SF.subscription_status) ??
      fields.subscription_status ??
      fields.Payment_Status ??
      fields.payment_status ??
      ''
  ).toLowerCase();

  if (/inactive|disabled|معطل|موقوف/.test(status)) return false;
  if (/expired|منته|lapsed/.test(subscription)) return false;
  if (isSubscriptionActive(subscription)) return true;
  if (/b2b_premium|premium|active|نشط|مفعل|فعال/.test(subscription)) return true;
  if (/active|نشط|مفعل|فعال|b2b_premium|premium|new|جديد/.test(status)) return true;
  return Boolean(
    getField(fields, SF.child_interactive_token) || studentOrFields?.childInteractiveToken
  );
}

async function verifyChildViaServer(inputToken) {
  const res = await fetch('/api/tawasul/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token: inputToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data?.kind === 'child' && data?.record?.id) {
    return mapStudent(data.record, 'ar');
  }
  // Propagate for local fallback (wrong sandbox base / transient miss)
  const err = new Error(data?.error || `VERIFY_${res.status}`);
  err.status = res.status;
  err.payload = data;
  throw err;
}

async function findStudentByChildTokenLocal(key) {
  const students = await fetchStudents();
  const list = Array.isArray(students) ? students : [];
  const hit =
    list.find((s) => normalizeToken(s.childInteractiveToken) === key) ||
    list.find((s) => normalizeToken(getField(s.fields, SF.child_interactive_token)) === key) ||
    null;
  if (!hit) return null;
  if (!isChildPortalActivated(hit)) return null;
  return hit;
}

/** Resolve student by child_interactive_token (AUN-CHD-...). */
export async function findStudentByChildToken(token) {
  const key = normalizeToken(token);
  if (!key || !key.startsWith('AUN-CHD-')) return null;

  try {
    const row = await verifyChildViaServer(token);
    if (row && isChildPortalActivated(row)) return row;
    if (row) return row;
  } catch (serverErr) {
    if (import.meta.env.PROD && serverErr?.status !== 401 && serverErr?.status !== 403) {
      console.error('[childAccess] server verify failed:', serverErr?.message);
      return null;
    }
    // Dev / sovereign: fall back to direct Students table on appaGfKj4vYhMw0cb
    try {
      return await findStudentByChildTokenLocal(key);
    } catch (localErr) {
      console.error('[childAccess] local fallback failed:', localErr?.message);
      return null;
    }
  }

  // Server returned a row that failed activation — try local sovereign table once
  if (!import.meta.env.PROD) {
    try {
      return await findStudentByChildTokenLocal(key);
    } catch {
      /* ignore */
    }
  }
  return null;
}

export function parseChildRouteToken() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('token')?.trim() || null;
}
