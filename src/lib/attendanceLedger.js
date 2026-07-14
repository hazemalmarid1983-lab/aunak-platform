/**
 * Immutable daily attendance ledger — anti-retroactive-edit (Oman center governance).
 * Offline-first localStorage + Airtable sync for ministry committees.
 */

import {
  fetchCloudAttendance,
  mergeAttendanceIntoLocal,
  pushAttendanceCorrection,
  pushAttendanceSeal,
} from './governanceCloud';

const LS_KEY = 'aunak.attendanceLedger.v1';
const CORRECTIONS_KEY = 'aunak.attendanceCorrections.v1';

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  EXCUSED: 'excused',
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function readList(key) {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* quota */
  }
}

async function sha256Hex(text) {
  if (typeof crypto === 'undefined' || !crypto.subtle) {
    return `fallback-${String(text).length}-${Date.now()}`;
  }
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function attendanceKey(studentId, date) {
  return `${String(studentId)}::${String(date).slice(0, 10)}`;
}

/** Find sealed record for student+date (immutable). */
export function getSealedAttendance(studentId, date) {
  const d = String(date || todayIso()).slice(0, 10);
  const key = attendanceKey(studentId, d);
  return readList(LS_KEY).find((r) => r.key === key && r.sealed) ?? null;
}

export function listAttendanceForStudent(studentId, { from, to } = {}) {
  const sid = String(studentId ?? '');
  return readList(LS_KEY)
    .filter((r) => r.studentId === sid && r.sealed)
    .filter((r) => {
      if (from && r.date < from) return false;
      if (to && r.date > to) return false;
      return true;
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function listAllSealedAttendance() {
  return readList(LS_KEY).filter((r) => r.sealed);
}

/**
 * Pull cloud attendance into local cache (call on governance / ministry load).
 */
export async function hydrateAttendanceFromCloud() {
  try {
    const cloud = await fetchCloudAttendance();
    mergeAttendanceIntoLocal(cloud, readList, writeList, LS_KEY);
    return { ok: true, count: cloud.length };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

/**
 * Seal today's (or given) attendance — irreversible for that day + cloud push.
 */
export async function sealAttendanceDay({
  studentId,
  studentName = '',
  date = todayIso(),
  status,
  recordedBy = '',
  centerId = '',
  biometricVerified = false,
  note = '',
}) {
  const d = String(date).slice(0, 10);
  const sid = String(studentId ?? '').trim();
  if (!sid) return { ok: false, error: 'MISSING_STUDENT' };
  if (!Object.values(ATTENDANCE_STATUS).includes(status)) {
    return { ok: false, error: 'INVALID_STATUS' };
  }

  const existing = getSealedAttendance(sid, d);
  if (existing) {
    return { ok: false, error: 'ALREADY_SEALED', existing };
  }

  const sealedAt = new Date().toISOString();
  const payload = {
    studentId: sid,
    studentName: String(studentName || '').trim(),
    date: d,
    status,
    recordedBy: String(recordedBy || '').trim(),
    centerId: String(centerId || '').trim(),
    biometricVerified: Boolean(biometricVerified),
    note: String(note || '').trim().slice(0, 500),
    sealedAt,
  };
  const immutableHash = await sha256Hex(JSON.stringify(payload));
  const record = {
    ...payload,
    key: attendanceKey(sid, d),
    sealed: true,
    immutableHash,
    id: `att-${sid.slice(0, 8)}-${d}-${immutableHash.slice(0, 8)}`,
  };

  const list = readList(LS_KEY);
  list.push(record);
  writeList(LS_KEY, list);

  const cloud = await pushAttendanceSeal(record);
  return {
    ok: true,
    record,
    cloudSynced: Boolean(cloud?.ok),
    cloudError: cloud?.ok ? null : cloud?.error || cloud?.reason || null,
  };
}

/**
 * Correction request only — never mutates the sealed day.
 */
export async function requestAttendanceCorrection({
  studentId,
  date,
  requestedStatus,
  reason,
  requestedBy,
}) {
  const existing = getSealedAttendance(studentId, date);
  if (!existing) return { ok: false, error: 'NO_SEALED_RECORD' };
  if (!Object.values(ATTENDANCE_STATUS).includes(requestedStatus)) {
    return { ok: false, error: 'INVALID_STATUS' };
  }
  const reasonText = String(reason ?? '').trim();
  if (reasonText.length < 8) return { ok: false, error: 'REASON_TOO_SHORT' };

  const req = {
    id: `corr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    studentId: String(studentId),
    date: String(date).slice(0, 10),
    originalStatus: existing.status,
    requestedStatus,
    reason: reasonText.slice(0, 800),
    requestedBy: String(requestedBy || '').trim(),
    requestedAt: new Date().toISOString(),
    status: 'pending',
    originalHash: existing.immutableHash,
  };
  const list = readList(CORRECTIONS_KEY);
  list.push(req);
  writeList(CORRECTIONS_KEY, list);

  const cloud = await pushAttendanceCorrection(req);
  return {
    ok: true,
    request: req,
    cloudSynced: Boolean(cloud?.ok),
    cloudError: cloud?.ok ? null : cloud?.error || null,
  };
}

export function listPendingCorrections() {
  return readList(CORRECTIONS_KEY).filter((c) => c.status === 'pending');
}

/** Month summary for parent / ministry views */
export function monthAttendanceSummary(studentId, yearMonth) {
  const ym = String(yearMonth || todayIso().slice(0, 7));
  const rows = listAttendanceForStudent(studentId, {
    from: `${ym}-01`,
    to: `${ym}-31`,
  });
  const present = rows.filter((r) => r.status === ATTENDANCE_STATUS.PRESENT).length;
  const absent = rows.filter((r) => r.status === ATTENDANCE_STATUS.ABSENT).length;
  const excused = rows.filter((r) => r.status === ATTENDANCE_STATUS.EXCUSED).length;
  return { yearMonth: ym, present, absent, excused, totalSealed: rows.length, rows };
}
