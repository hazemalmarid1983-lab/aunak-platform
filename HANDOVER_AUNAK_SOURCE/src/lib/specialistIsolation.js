import { getField } from './airtable';
import { SPECIALIST as SP, STUDENT as SF } from './airtableFields';
import { TAWASUL_MAX_CASES_PER_SPECIALIST } from './tawasulConfig';

function toIdList(raw) {
  if (raw == null || raw === '') return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((v) => (typeof v === 'string' ? v : v?.id))
    .filter((id) => id && /^rec[a-zA-Z0-9]{10,}$/.test(String(id)));
}

function linkedSpecialistIds(student) {
  const f = student?.fields ?? {};
  const raw = student?.assignedSpecialistIds ?? getField(f, SF.assigned_specialist);
  return toIdList(raw);
}

/** Student record IDs linked on the Specialists.Students field (live Tawasul base). */
export function linkedStudentIdsFromSpecialistRecord(specialistRecord) {
  const f = specialistRecord?.fields;
  if (!f || typeof f !== 'object') return [];
  const raw = f?.Students ?? f?.students ?? f?.[SP.students] ?? f?.assigned_specialist ?? null;
  return toIdList(raw);
}

/** Permy-filter: specialist sees only students linked to their Airtable record ID. */
export function filterStudentsBySpecialist(students, specialistRecordId, { maxCases = TAWASUL_MAX_CASES_PER_SPECIALIST } = {}) {
  if (!specialistRecordId) return [];
  const list = Array.isArray(students) ? students : [];
  return list
    .filter((s) => linkedSpecialistIds(s).includes(specialistRecordId))
    .slice(0, maxCases);
}

export function filterStudentsByLinkedIds(students, studentIds, { maxCases = TAWASUL_MAX_CASES_PER_SPECIALIST } = {}) {
  const ids = toIdList(studentIds);
  if (!ids.length) return [];
  const idSet = new Set(ids);
  return (Array.isArray(students) ? students : [])
    .filter((s) => idSet.has(s.id))
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

export function resolveSpecialistCaseload(students, session, specialistRecord) {
  const bySpecialistStudents = filterStudentsByLinkedIds(
    students,
    linkedStudentIdsFromSpecialistRecord(specialistRecord)
  );
  if (bySpecialistStudents.length > 0) return bySpecialistStudents;

  const byAssigned = filterStudentsBySpecialist(students, session?.specialistRecordId);
  if (byAssigned.length > 0) return byAssigned;

  return filterStudentsBySpecialistToken(students, session?.specialistToken);
}
