/**
 * Teacher IEP goal selection from bank + custom pending + sealed evidence.
 * Local cache + Airtable Students / Goal Evidence sync.
 */

import { getGoalById } from './goalBank';
import {
  fetchCloudEvidence,
  mergeEvidenceIntoLocal,
  parseCustomPendingFromFields,
  parseStudentGoalPlanFromFields,
  pushCustomGoalsPending,
  pushGoalEvidence,
  pushStudentGoalPlan,
} from './governanceCloud';
import { getField } from './airtable';
import { STUDENT as SF } from './airtableFields';

const ASSIGN_KEY = 'aunak.iepAssignments.v1';
const EVIDENCE_KEY = 'aunak.iepEvidence.v1';
const CUSTOM_KEY = 'aunak.iepCustomPending.v1';

const MAX_ACTIVE_GOALS = 6;

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
    /* ignore */
  }
}

export function getStudentGoalPlan(studentId) {
  const sid = String(studentId ?? '');
  return (
    readList(ASSIGN_KEY).find((p) => p.studentId === sid) ?? {
      studentId: sid,
      goals: [],
      updatedAt: null,
      updatedBy: '',
    }
  );
}

/**
 * Hydrate goals + evidence from Airtable for one student (or all evidence).
 * @param {object} [student] mapped student with fields
 */
export async function hydrateGoalsFromCloud(student = null) {
  try {
    const sid = student?.id;
    if (sid && student?.fields) {
      const plan = parseStudentGoalPlanFromFields(student.fields);
      if (plan?.goals?.length) {
        const list = readList(ASSIGN_KEY).filter((p) => p.studentId !== sid);
        list.push({ ...plan, studentId: sid });
        writeList(ASSIGN_KEY, list);
      }
      const pending = parseCustomPendingFromFields(student.fields);
      if (pending.length) {
        const others = readList(CUSTOM_KEY).filter((c) => c.studentId !== sid);
        writeList(CUSTOM_KEY, [...others, ...pending]);
      }
      const sev = getField(student.fields, SF.iep_support_severity);
      if (sev) {
        try {
          sessionStorage.setItem(`aunak.iepSeverity.${sid}`, String(sev));
        } catch {
          /* ignore */
        }
      }
    }

    const cloudEv = await fetchCloudEvidence(sid || null);
    mergeEvidenceIntoLocal(cloudEv, readList, writeList, EVIDENCE_KEY);
    return { ok: true, evidence: cloudEv.length };
  } catch (err) {
    return { ok: false, error: err?.message || String(err) };
  }
}

/**
 * Replace active goals with bank selections (max 6) + cloud push.
 */
export async function assignBankGoals({
  studentId,
  goalIds = [],
  teacherId = '',
  teacherName = '',
  severity = null,
}) {
  const sid = String(studentId ?? '').trim();
  if (!sid) return { ok: false, error: 'MISSING_STUDENT' };
  const unique = [...new Set(goalIds.map(String))].slice(0, MAX_ACTIVE_GOALS);
  const goals = unique
    .map((id) => {
      const g = getGoalById(id);
      if (!g) return null;
      return {
        goalId: g.id,
        labelAr: g.ar,
        labelEn: g.en,
        domain: g.domain,
        source: g.source,
        assignedAt: new Date().toISOString(),
      };
    })
    .filter(Boolean);

  if (!goals.length) return { ok: false, error: 'NO_VALID_GOALS' };

  const plan = {
    studentId: sid,
    goals,
    updatedAt: new Date().toISOString(),
    updatedBy: String(teacherId || teacherName || '').trim(),
  };

  const list = readList(ASSIGN_KEY).filter((p) => p.studentId !== sid);
  list.push(plan);
  writeList(ASSIGN_KEY, list);

  const cloud = await pushStudentGoalPlan(sid, plan, severity);
  return {
    ok: true,
    plan,
    cloudSynced: Boolean(cloud?.ok),
    cloudError: cloud?.ok ? null : cloud?.error || null,
  };
}

/** Custom goal — pending supervisor approval (Wajhatna pattern). */
export async function submitCustomGoal({ studentId, textAr, textEn = '', teacherId = '' }) {
  const label = String(textAr ?? '').trim();
  if (label.length < 8) return { ok: false, error: 'GOAL_TOO_SHORT' };
  const sid = String(studentId ?? '').trim();
  if (!sid) return { ok: false, error: 'MISSING_STUDENT' };

  const item = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    studentId: sid,
    textAr: label.slice(0, 400),
    textEn: String(textEn || '').trim().slice(0, 400),
    teacherId: String(teacherId || '').trim(),
    submittedAt: new Date().toISOString(),
    status: 'pending',
  };
  const list = readList(CUSTOM_KEY);
  list.push(item);
  writeList(CUSTOM_KEY, list);

  const pending = listPendingCustomGoals(sid);
  const cloud = await pushCustomGoalsPending(sid, pending);
  return {
    ok: true,
    item,
    cloudSynced: Boolean(cloud?.ok),
    cloudError: cloud?.ok ? null : cloud?.error || null,
  };
}

export function listPendingCustomGoals(studentId) {
  const sid = String(studentId ?? '');
  return readList(CUSTOM_KEY).filter(
    (c) => c.status === 'pending' && (!sid || c.studentId === sid)
  );
}

/**
 * Seal one evidence entry for a goal (note required; optional photo data URL).
 */
export async function sealGoalEvidence({
  studentId,
  goalId,
  note,
  successPercent = null,
  photoDataUrl = null,
  teacherId = '',
  date = new Date().toISOString().slice(0, 10),
}) {
  const sid = String(studentId ?? '').trim();
  const gid = String(goalId ?? '').trim();
  const noteText = String(note ?? '').trim();
  if (!sid || !gid) return { ok: false, error: 'MISSING_IDS' };
  if (noteText.length < 12) return { ok: false, error: 'NOTE_REQUIRED' };

  const plan = getStudentGoalPlan(sid);
  const onPlan =
    plan.goals.some((g) => g.goalId === gid) ||
    listPendingCustomGoals(sid).some((c) => c.id === gid);
  const bankGoal = getGoalById(gid);
  if (!onPlan && !bankGoal) return { ok: false, error: 'GOAL_NOT_ON_PLAN' };

  let pct = successPercent == null || successPercent === '' ? null : Number(successPercent);
  if (pct != null && (!Number.isFinite(pct) || pct < 0 || pct > 100)) {
    return { ok: false, error: 'INVALID_PERCENT' };
  }

  const sealedAt = new Date().toISOString();
  const payload = {
    studentId: sid,
    goalId: gid,
    labelAr: bankGoal?.ar ?? plan.goals.find((g) => g.goalId === gid)?.labelAr ?? '',
    date: String(date).slice(0, 10),
    note: noteText.slice(0, 1000),
    successPercent: pct,
    hasPhoto: Boolean(photoDataUrl),
    photoDataUrl: photoDataUrl ? String(photoDataUrl).slice(0, 400_000) : null,
    teacherId: String(teacherId || '').trim(),
    sealedAt,
  };

  let immutableHash = `ev-${sealedAt}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const buf = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(JSON.stringify({ ...payload, photoDataUrl: payload.hasPhoto }))
    );
    immutableHash = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  const record = {
    ...payload,
    photoDataUrl: payload.photoDataUrl,
    sealed: true,
    immutableHash,
    id: `ev-${immutableHash.slice(0, 12)}`,
  };

  const list = readList(EVIDENCE_KEY);
  list.push(record);
  writeList(EVIDENCE_KEY, list);

  const cloud = await pushGoalEvidence(record);
  return {
    ok: true,
    record,
    cloudSynced: Boolean(cloud?.ok),
    cloudError: cloud?.ok ? null : cloud?.error || cloud?.reason || null,
  };
}

export function listGoalEvidence(studentId, { goalId, from, to } = {}) {
  const sid = String(studentId ?? '');
  return readList(EVIDENCE_KEY)
    .filter((e) => e.studentId === sid && e.sealed)
    .filter((e) => (goalId ? e.goalId === goalId : true))
    .filter((e) => {
      if (from && e.date < from) return false;
      if (to && e.date > to) return false;
      return true;
    })
    .sort((a, b) => `${b.date}${b.sealedAt}`.localeCompare(`${a.date}${a.sealedAt}`));
}

export function listAllGoalEvidence() {
  return readList(EVIDENCE_KEY).filter((e) => e.sealed);
}

export function goalsWithoutEvidence(studentId) {
  const plan = getStudentGoalPlan(studentId);
  const evidence = listGoalEvidence(studentId);
  return plan.goals.filter((g) => !evidence.some((e) => e.goalId === g.goalId));
}
