import { fetchStudents, getField } from './airtable';
import { STUDENT as SF } from './airtableFields';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

/** Resolve student by child_interactive_token (AUN-CHD-...). */
export async function findStudentByChildToken(token) {
  const key = normalizeToken(token);
  if (!key || !key.startsWith('AUN-CHD-')) return null;

  const students = await fetchStudents();
  return (
    students.find((s) => normalizeToken(s.childInteractiveToken) === key) ||
    students.find((s) => normalizeToken(getField(s.fields, SF.child_interactive_token)) === key) ||
    null
  );
}

export function parseChildRouteToken() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('token')?.trim() || null;
}
