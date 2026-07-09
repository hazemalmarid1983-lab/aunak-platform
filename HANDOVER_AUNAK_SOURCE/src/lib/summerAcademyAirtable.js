/**
 * Summer Academy — silent cloud persistence (Airtable + localStorage backup)
 */

import { fetchAllRecords } from './airtable';
import { AIRTABLE_TABLES } from './airtableTables';
import { SUMMER_ACADEMY as SA } from './airtableFields';

const LS_KEY = 'aunak.summerAcademy.v1';
const USE_PROXY = import.meta.env.VITE_USE_AIRTABLE_PROXY === 'true';

function summerTableId() {
  const id = AIRTABLE_TABLES.summerAcademy;
  return id && String(id).trim() ? String(id).trim() : '';
}

function scrubFields(fields) {
  const out = {};
  for (const [k, v] of Object.entries(fields || {})) {
    if (v !== undefined && v !== null && v !== '') out[k] = v;
  }
  return out;
}

async function cloudWrite(fields) {
  const tableId = summerTableId();
  if (!tableId) return null;

  const body = { fields: scrubFields(fields) };
  const token = import.meta.env.VITE_AIRTABLE_API_KEY || import.meta.env.VITE_AIRTABLE_PAT;
  const baseId = import.meta.env.VITE_AIRTABLE_BASE_ID;

  if (USE_PROXY) {
    const res = await fetch(`/api/airtable?table=${encodeURIComponent(tableId)}`, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }

  if (!token || !baseId) return null;
  const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableId}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

function readBackup() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeBackup(all) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(all));
  } catch {
    /* ignore */
  }
}

function backupKey(studentId) {
  return String(studentId ?? 'anonymous');
}

export function loadLocalProgress(studentId) {
  const all = readBackup();
  return all[backupKey(studentId)] ?? null;
}

export function saveLocalProgress(studentId, progress) {
  const all = readBackup();
  all[backupKey(studentId)] = { ...progress, updatedAt: new Date().toISOString() };
  writeBackup(all);
  return all[backupKey(studentId)];
}

async function saveSilentEvent(fields) {
  const record = {
    [SA.student_name]: fields.studentName,
    [SA.event_type]: fields.eventType,
    [SA.track]: fields.track ?? '',
    [SA.silent_level]: fields.silentLevel ?? null,
    [SA.baseline_level]: fields.baselineLevel ?? null,
    [SA.current_level]: fields.currentLevel ?? null,
    [SA.weak_points]: fields.weakPoints ?? '',
    [SA.daily_xp]: fields.dailyXp ?? null,
    [SA.tasks_completed]: fields.tasksCompleted ?? null,
    [SA.total_xp]: fields.totalXp ?? null,
    [SA.progress_json]: fields.progressJson ?? '',
    [SA.recorded_at]: fields.recordedAt ?? new Date().toISOString(),
    [SA.session_date]: fields.sessionDate ?? new Date().toISOString().slice(0, 10),
  };
  if (fields.studentId) record[SA.student] = [fields.studentId];

  if (!summerTableId()) return;

  try {
    await cloudWrite(record);
  } catch (err) {
    console.warn('[summerAcademy] silent event:', err.message);
  }
}

/** Silent save — assessment results, never shown to child. */
export async function saveSilentAssessment({ studentId, studentName, assessment }) {
  const recordedAt = new Date().toISOString();
  const sessionDate = recordedAt.slice(0, 10);

  for (const [track, level] of Object.entries(assessment.levels ?? {})) {
    await saveSilentEvent({
      studentId,
      studentName,
      eventType: 'track_baseline',
      track,
      silentLevel: level,
      baselineLevel: level,
      currentLevel: level,
      weakPoints: assessment.weakPoints?.[track] ?? '',
      recordedAt,
      sessionDate,
    });
  }

  await saveSilentEvent({
    studentId,
    studentName,
    eventType: 'silent_assessment',
    weakPoints: JSON.stringify(assessment.weakPoints ?? {}),
    progressJson: JSON.stringify({
      levels: assessment.levels,
      rawScores: assessment.rawScores,
    }),
    recordedAt,
    sessionDate,
  });
}

export async function saveProgressSnapshot({ studentId, studentName, progress }) {
  saveLocalProgress(studentId, progress);

  await saveSilentEvent({
    studentId,
    studentName,
    eventType: 'progress_snapshot',
    dailyXp: progress.dailyXp,
    tasksCompleted: progress.totalTasksCompleted,
    totalXp: progress.totalXp,
    progressJson: JSON.stringify({
      currentLevels: progress.currentLevels,
      baselineLevels: progress.baselineLevels,
      streak: progress.streak,
    }),
  });
}

export async function fetchLeaderboardEntries() {
  const localAll = readBackup();
  const localEntries = Object.values(localAll).map((p) => ({
    studentId: p.studentId,
    displayName: p.studentName,
    tasksCompleted: p.totalTasksCompleted ?? 0,
    dailyXp: p.dailyXp ?? 0,
    totalXp: p.totalXp ?? 0,
    streak: p.streak ?? 0,
  }));

  const tableId = summerTableId();
  if (!tableId) return localEntries;

  try {
    const records = await fetchAllRecords(tableId, {
      filterByFormula: `{${SA.event_type}}='progress_snapshot'`,
      maxRecords: 100,
    });
    const cloud = (records ?? []).map((r) => {
      const f = r.fields ?? {};
      let extra = {};
      try {
        extra = JSON.parse(f[SA.progress_json] ?? '{}');
      } catch {
        /* ignore */
      }
      return {
        studentId: Array.isArray(f[SA.student]) ? f[SA.student][0] : null,
        displayName: f[SA.student_name] ?? 'مغامر',
        tasksCompleted: f[SA.tasks_completed] ?? 0,
        dailyXp: f[SA.daily_xp] ?? 0,
        totalXp: f[SA.total_xp] ?? 0,
        streak: extra.streak ?? 0,
      };
    });
    const merged = new Map();
    for (const e of [...localEntries, ...cloud]) {
      const key = e.studentId ?? e.displayName;
      const prev = merged.get(key);
      if (!prev || e.totalXp > prev.totalXp) merged.set(key, e);
    }
    return [...merged.values()];
  } catch (err) {
    console.warn('[summerAcademy] leaderboard fetch:', err.message);
    return localEntries;
  }
}

export async function loadStudentProgress(studentId) {
  const local = loadLocalProgress(studentId);
  if (local) return local;
  return null;
}

export { SA as SA_FIELDS };
