/**
 * Persist clinical questionnaire sessions (local + optional Airtable Students field).
 */

import { updateStudentRecord, getField } from './airtable';
import { STUDENT as SF } from './airtableFields';

const LS_KEY = 'aunak.clinicalQuestionnaire.v1';

function readAll() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(map) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(map));
  } catch {
    /* quota */
  }
}

export function loadClinicalSessions(studentId) {
  if (!studentId) return [];
  const entry = readAll()[studentId];
  if (Array.isArray(entry)) return entry;
  if (entry?.sessions) return entry.sessions;
  return [];
}

export function saveClinicalSessions(studentId, sessions) {
  if (!studentId) return { ok: false, error: 'MISSING_STUDENT' };
  const map = readAll();
  map[studentId] = { sessions, updatedAt: new Date().toISOString() };
  writeAll(map);
  return { ok: true, sessions };
}

export function upsertClinicalSession(session) {
  if (!session?.studentId) return { ok: false, error: 'MISSING_STUDENT' };
  const list = loadClinicalSessions(session.studentId);
  const idx = list.findIndex((s) => s.id === session.id);
  const next = [...list];
  if (idx >= 0) next[idx] = session;
  else next.unshift(session);
  return saveClinicalSessions(session.studentId, next);
}

export async function pushClinicalToCloud(studentId, sessions) {
  if (!studentId) return { ok: false, skipped: true };
  try {
    const payload = { sessions, version: 1, updatedAt: new Date().toISOString() };
    await updateStudentRecord(studentId, {
      [SF.clinical_questionnaire_json]: JSON.stringify(payload),
      [SF.comprehensive_assessment_status]:
        sessions.some((s) => s.status === 'completed') ? 'in_progress' : 'not_started',
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export function hydrateClinicalFromStudentFields(student) {
  if (!student?.id) return [];
  const fields = student.fields || student;
  const raw = getField(fields, SF.clinical_questionnaire_json);
  if (raw) {
    try {
      const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
      const sessions = parsed?.sessions ?? (Array.isArray(parsed) ? parsed : []);
      if (sessions.length) {
        saveClinicalSessions(student.id, sessions);
        return sessions;
      }
    } catch {
      /* ignore */
    }
  }
  return loadClinicalSessions(student.id);
}
