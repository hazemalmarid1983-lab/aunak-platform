import { fetchStudents, getField } from './airtable';
import { mapStudent } from './airtableMappers';
import { STUDENT as SF } from './airtableFields';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

async function verifyEnglishViaServer(inputToken) {
  const res = await fetch('/api/tawasul/verify-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ token: inputToken }),
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok && data?.kind === 'english' && data?.record?.id) {
    return mapStudent(data.record, 'en');
  }
  if (res.status === 401 || res.status === 403) return null;
  throw new Error(data?.error || `VERIFY_${res.status}`);
}

/** Resolve a student by student_english_token (AUN-ENG-...). */
export async function findStudentByEnglishToken(token) {
  const key = normalizeToken(token);
  if (!key || !key.startsWith('AUN-ENG-')) return null;

  try {
    return await verifyEnglishViaServer(token);
  } catch (serverErr) {
    if (import.meta.env.PROD) {
      console.error('[englishAccess] server verify failed:', serverErr?.message);
      return null;
    }
    const students = await fetchStudents();
    return (
      students.find((s) => normalizeToken(s.studentEnglishToken) === key) ||
      students.find((s) => normalizeToken(getField(s.fields, SF.student_english_token)) === key) ||
      null
    );
  }
}

export function parseEnglishRouteToken() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('token')?.trim() || null;
}
