/**
 * Cloud sync for governance ledgers → Airtable (ministry-ready).
 * Local sealed copies remain offline-first; cloud is source of truth when available.
 */

import {
  createAirtableRecord,
  fetchAirtableRecords,
  updateStudentRecord,
  getField,
} from './airtable';
import { AIRTABLE_TABLES } from './airtableTables';
import {
  ATTENDANCE_LEDGER as AL,
  GOAL_EVIDENCE as GE,
  ATTENDANCE_CORRECTION as AC,
  STUDENT as SF,
} from './airtableFields';

function hasTable(id) {
  return Boolean(id && String(id).startsWith('tbl'));
}

export function governanceCloudReady() {
  return {
    attendance: hasTable(AIRTABLE_TABLES.attendanceLedger),
    evidence: hasTable(AIRTABLE_TABLES.goalEvidence),
    corrections: hasTable(AIRTABLE_TABLES.attendanceCorrections),
  };
}

function mapAttendanceRow(rec) {
  const f = rec.fields || rec;
  const studentId = String(getField(f, AL.student_record_id) || '').trim();
  const date = String(getField(f, AL.attendance_date) || '').slice(0, 10);
  return {
    id: rec.id,
    airtableId: rec.id,
    key: getField(f, AL.ledger_key) || `${studentId}::${date}`,
    studentId,
    studentName: getField(f, AL.student_name) || '',
    date,
    status: getField(f, AL.status) || '',
    sealedAt: getField(f, AL.sealed_at) || '',
    immutableHash: getField(f, AL.immutable_hash) || '',
    recordedBy: getField(f, AL.recorded_by) || '',
    biometricVerified: Boolean(getField(f, AL.biometric_verified)),
    note: getField(f, AL.note) || '',
    centerId: getField(f, AL.center_id) || '',
    sealed: true,
  };
}

function mapEvidenceRow(rec) {
  const f = rec.fields || rec;
  return {
    id: rec.id,
    airtableId: rec.id,
    studentId: String(getField(f, GE.student_record_id) || '').trim(),
    goalId: getField(f, GE.goal_id) || '',
    labelAr: getField(f, GE.goal_label) || '',
    date: String(getField(f, GE.evidence_date) || '').slice(0, 10),
    note: getField(f, GE.note) || '',
    successPercent: getField(f, GE.success_percent) ?? null,
    hasPhoto: Boolean(getField(f, GE.has_photo)),
    photoDataUrl: null,
    teacherId: getField(f, GE.teacher_id) || '',
    sealedAt: getField(f, GE.sealed_at) || '',
    immutableHash: getField(f, GE.immutable_hash) || '',
    sealed: true,
  };
}

/** Push sealed attendance to Airtable (skip if duplicate ledger_key). */
export async function pushAttendanceSeal(record) {
  const tableId = AIRTABLE_TABLES.attendanceLedger;
  if (!hasTable(tableId) || !record?.key) {
    return { ok: false, skipped: true, reason: 'NO_TABLE' };
  }
  try {
    const existing = await fetchAirtableRecords(tableId).catch(() => []);
    const dup = (existing || []).find((r) => getField(r.fields || r, AL.ledger_key) === record.key);
    if (dup) return { ok: true, skipped: true, reason: 'ALREADY_CLOUD', id: dup.id };

    const created = await createAirtableRecord(tableId, {
      [AL.ledger_key]: record.key,
      [AL.student_record_id]: record.studentId,
      [AL.student_name]: record.studentName || '',
      [AL.attendance_date]: record.date,
      [AL.status]: record.status,
      [AL.sealed_at]: record.sealedAt,
      [AL.immutable_hash]: record.immutableHash,
      [AL.recorded_by]: record.recordedBy || '',
      [AL.biometric_verified]: Boolean(record.biometricVerified),
      [AL.note]: record.note || '',
      [AL.center_id]: record.centerId || '',
    });
    return { ok: true, id: created?.id || created };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export async function pushAttendanceCorrection(req) {
  const tableId = AIRTABLE_TABLES.attendanceCorrections;
  if (!hasTable(tableId) || !req) return { ok: false, skipped: true };
  try {
    const created = await createAirtableRecord(tableId, {
      [AC.student_record_id]: req.studentId,
      [AC.attendance_date]: req.date,
      [AC.original_status]: req.originalStatus,
      [AC.requested_status]: req.requestedStatus,
      [AC.reason]: req.reason,
      [AC.requested_by]: req.requestedBy || '',
      [AC.requested_at]: req.requestedAt,
      [AC.status]: req.status || 'pending',
      [AC.original_hash]: req.originalHash || '',
    });
    return { ok: true, id: created?.id || created };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export async function pushGoalEvidence(record) {
  const tableId = AIRTABLE_TABLES.goalEvidence;
  if (!hasTable(tableId) || !record) return { ok: false, skipped: true, reason: 'NO_TABLE' };
  try {
    const existing = await fetchAirtableRecords(tableId).catch(() => []);
    const dup = (existing || []).find(
      (r) => getField(r.fields || r, GE.immutable_hash) === record.immutableHash
    );
    if (dup) return { ok: true, skipped: true, id: dup.id };

    const created = await createAirtableRecord(tableId, {
      [GE.student_record_id]: record.studentId,
      [GE.goal_id]: record.goalId,
      [GE.goal_label]: record.labelAr || '',
      [GE.evidence_date]: record.date,
      [GE.note]: record.note,
      [GE.success_percent]:
        record.successPercent == null ? undefined : Number(record.successPercent),
      [GE.has_photo]: Boolean(record.hasPhoto),
      [GE.sealed_at]: record.sealedAt,
      [GE.immutable_hash]: record.immutableHash,
      [GE.teacher_id]: record.teacherId || '',
    });
    return { ok: true, id: created?.id || created };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

/** Persist active IEP plan JSON on Students row */
export async function pushStudentGoalPlan(studentId, plan, severity = null) {
  if (!studentId || !plan) return { ok: false, skipped: true };
  try {
    const fields = {
      [SF.active_iep_goals]: JSON.stringify(plan),
    };
    if (severity) fields[SF.iep_support_severity] = severity;
    if (plan.customPending) {
      fields[SF.custom_goals_pending] = JSON.stringify(plan.customPending);
    }
    await updateStudentRecord(studentId, fields);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

export async function pushCustomGoalsPending(studentId, pendingList) {
  if (!studentId) return { ok: false };
  try {
    await updateStudentRecord(studentId, {
      [SF.custom_goals_pending]: JSON.stringify(pendingList || []),
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

/** Pull all sealed attendance from cloud */
export async function fetchCloudAttendance() {
  const tableId = AIRTABLE_TABLES.attendanceLedger;
  if (!hasTable(tableId)) return [];
  const rows = await fetchAirtableRecords(tableId).catch(() => []);
  return (rows || []).map(mapAttendanceRow).filter((r) => r.studentId && r.date);
}

export async function fetchCloudEvidence(studentId = null) {
  const tableId = AIRTABLE_TABLES.goalEvidence;
  if (!hasTable(tableId)) return [];
  const rows = await fetchAirtableRecords(tableId).catch(() => []);
  return (rows || [])
    .map(mapEvidenceRow)
    .filter((r) => r.studentId && (!studentId || r.studentId === studentId));
}

export async function fetchCloudCorrections() {
  const tableId = AIRTABLE_TABLES.attendanceCorrections;
  if (!hasTable(tableId)) return [];
  const rows = await fetchAirtableRecords(tableId).catch(() => []);
  return (rows || []).map((rec) => {
    const f = rec.fields || rec;
    return {
      id: rec.id,
      studentId: getField(f, AC.student_record_id),
      date: String(getField(f, AC.attendance_date) || '').slice(0, 10),
      originalStatus: getField(f, AC.original_status),
      requestedStatus: getField(f, AC.requested_status),
      reason: getField(f, AC.reason),
      requestedBy: getField(f, AC.requested_by),
      requestedAt: getField(f, AC.requested_at),
      status: getField(f, AC.status) || 'pending',
      originalHash: getField(f, AC.original_hash),
    };
  });
}

/** Merge cloud attendance into localStorage (cloud wins on same key). */
export function mergeAttendanceIntoLocal(cloudRows, readList, writeList, lsKey) {
  const local = readList(lsKey);
  const byKey = new Map(local.map((r) => [r.key, r]));
  for (const c of cloudRows) {
    if (!c.key) continue;
    byKey.set(c.key, { ...c, sealed: true });
  }
  const merged = [...byKey.values()];
  writeList(lsKey, merged);
  return merged;
}

export function mergeEvidenceIntoLocal(cloudRows, readList, writeList, lsKey) {
  const local = readList(lsKey);
  const byHash = new Map(
    local.filter((r) => r.immutableHash).map((r) => [r.immutableHash, r])
  );
  for (const c of cloudRows) {
    if (c.immutableHash) byHash.set(c.immutableHash, { ...c, sealed: true });
    else byHash.set(c.id || `${c.studentId}-${c.date}-${c.goalId}`, c);
  }
  const merged = [...byHash.values()];
  writeList(lsKey, merged);
  return merged;
}

/** Parse goal plan from student Airtable fields */
export function parseStudentGoalPlanFromFields(fields) {
  const raw = getField(fields, SF.active_iep_goals);
  if (!raw) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (parsed?.goals) return parsed;
    if (Array.isArray(parsed)) return { goals: parsed, studentId: null };
  } catch {
    return null;
  }
  return null;
}

export function parseCustomPendingFromFields(fields) {
  const raw = getField(fields, SF.custom_goals_pending);
  if (!raw) return [];
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
