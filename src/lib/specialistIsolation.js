import { getField } from './airtable';
import { STUDENT as SF } from './airtableFields';
import { TAWASUL_MAX_CASES_PER_SPECIALIST } from './tawasulConfig';

function linkedSpecialistIds(student) {
  const f = student?.fields ?? {};
  const raw = student?.assignedSpecialistIds ?? getField(f, SF.assigned_specialist);
  if (raw == null || raw === '') return [];
  return Array.isArray(raw) ? raw : [raw];
}

/** Permy-filter: specialist sees only students linked to their Airtable record ID. */
export function filterStudentsBySpecialist(students, specialistRecordId, { maxCases = TAWASUL_MAX_CASES_PER_SPECIALIST } = {}) {
  if (!specialistRecordId) return [];
  const list = Array.isArray(students) ? students : [];
  return list
    .filter((s) => linkedSpecialistIds(s).includes(specialistRecordId))
    .slice(0, maxCases);
}

/** Fallback token match when link field not yet populated (seed / migration). */
export function filterStudentsBySpecialistToken(students, specialistToken, { maxCases = TAWASUL_MAX_CASES_PER_SPECIALIST } = {}) {
  const key = String(specialistToken ?? '').trim().toUpperCase();
  if (!key) return [];
  return (Array.isArray(students) ? students : [])
    .filter((s) => {
      const f = s?.fields ?? {};
      const tok = String(getField(f, SF.specialist_tutor_token) ?? s.specialistTutorToken ?? '').trim().toUpperCase();
      return tok === key;
    })
    .slice(0, maxCases);
}

export function resolveSpecialistCaseload(students, session) {
  const byLink = filterStudentsBySpecialist(students, session?.specialistRecordId);
  if (byLink.length > 0) return byLink;
  return filterStudentsBySpecialistToken(students, session?.specialistToken);
}
