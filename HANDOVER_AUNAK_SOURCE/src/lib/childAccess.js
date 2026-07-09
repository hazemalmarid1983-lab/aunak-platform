import { fetchStudents, getField } from './airtable';
import { mapStudent } from './airtableMappers';
import { STUDENT as SF } from './airtableFields';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
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
  if (res.status === 401 || res.status === 403) return null;
  throw new Error(data?.error || `VERIFY_${res.status}`);
}

/** Resolve student by child_interactive_token (AUN-CHD-...). */
export async function findStudentByChildToken(token) {
  const key = normalizeToken(token);
  if (!key || !key.startsWith('AUN-CHD-')) return null;

  try {
    return await verifyChildViaServer(token);
  } catch (serverErr) {
    if (import.meta.env.PROD) {
      console.error('[childAccess] server verify failed:', serverErr?.message);
      return null;
    }
    const students = await fetchStudents();
    return (
      students.find((s) => normalizeToken(s.childInteractiveToken) === key) ||
      students.find((s) => normalizeToken(getField(s.fields, SF.child_interactive_token)) === key) ||
      null
    );
  }
}

export function parseChildRouteToken() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('token')?.trim() || null;
}
