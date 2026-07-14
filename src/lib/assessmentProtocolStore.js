/**
 * Persist operational assessment protocol sessions (local + optional Airtable Students field).
 */

import { updateStudentRecord, getField } from './airtable';
import { STUDENT as SF } from './airtableFields';

const LS_KEY = 'aunak.assessmentProtocol.v1';

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

export function loadProtocolSession(studentId) {
  if (!studentId) return null;
  return readAll()[studentId] || null;
}

export function saveProtocolSession(session) {
  if (!session?.studentId) return { ok: false, error: 'MISSING_STUDENT' };
  const map = readAll();
  map[session.studentId] = { ...session, updatedAt: new Date().toISOString() };
  writeAll(map);
  return { ok: true, session: map[session.studentId] };
}

export async function pushProtocolToCloud(session) {
  if (!session?.studentId) return { ok: false, skipped: true };
  try {
    const fields = {
      [SF.assessment_protocol_json]: JSON.stringify(session),
      [SF.assessment_protocol_status]: session.status || 'in_progress',
    };
    await updateStudentRecord(session.studentId, fields);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export function hydrateProtocolFromStudentFields(student) {
  if (!student?.id) return null;
  const fields = student.fields || student;
  const raw = getField(fields, SF.assessment_protocol_json);
  if (!raw) return loadProtocolSession(student.id);
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed?.studentId) {
      saveProtocolSession(parsed);
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return loadProtocolSession(student.id);
}

export async function sha256Hex(text) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return `fallback-${String(text).length}-${Date.now()}`;
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
