/**
 * Tawasul Daily Sessions seal — maps island bridge to live schema (Session Date, Session Notes, student link).
 */

import { createHash } from 'crypto';
import { airtableConfigFromEnv, sanitizeAscii } from './paymentActivation.js';
import { ISLAND_SEAL_MARKER, CHILD_ISLAND_SEAL_THRESHOLD } from './childSessionSeal.js';

export { CHILD_ISLAND_SEAL_THRESHOLD, ISLAND_SEAL_MARKER };

function sessionsTableId() {
  return (
    sanitizeAscii(process.env.AIRTABLE_DAILY_SESSIONS_TABLE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID) ||
    'tbl8su5soBPDeGb6Z'
  );
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function hashPayload(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function headers(apiKey) {
  return { Authorization: `Bearer ${sanitizeAscii(apiKey)}`, Accept: 'application/json' };
}

async function fetchTodaySessions(apiKey, baseId, studentRecordId, day) {
  const tableId = sessionsTableId();
  const formula = encodeURIComponent(
    `AND(FIND('${ISLAND_SEAL_MARKER}', {Session Notes}), {Session Date}='${day}')`
  );
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?filterByFormula=${formula}`;
  const res = await fetch(url, { headers: headers(apiKey) });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.records ?? []).filter((r) => {
    const links = r.fields?.student ?? [];
    const ids = Array.isArray(links) ? links : [links];
    return !studentRecordId || ids.includes(studentRecordId);
  });
}

export async function sealTawasulIslandSession({
  studentId,
  studentName,
  interactionCount = CHILD_ISLAND_SEAL_THRESHOLD,
  source = 'island_world',
  interactionType = 'play_engagement',
  config = airtableConfigFromEnv(),
}) {
  const name = String(studentName ?? '').trim();
  const { apiKey, baseId } = config;
  if (!apiKey) throw new Error('AIRTABLE_NOT_CONFIGURED');
  if (!name && !studentId) throw new Error('STUDENT_REQUIRED');

  const day = todayIsoDate();
  const existing = await fetchTodaySessions(apiKey, baseId, studentId, day);
  if (existing.some((r) => String(r.fields?.['Session Notes'] ?? '').includes(ISLAND_SEAL_MARKER))) {
    return { ok: true, alreadySealed: true, sessionDate: day };
  }

  const notes = `${ISLAND_SEAL_MARKER} · Sealed · ${source} · ${interactionType} · ${interactionCount} interactions · ${name}`;
  const fields = {
    'Session Date': day,
    'Session Notes': notes,
    'Daily Goal Achieved': true,
    'Session Duration (min)': Math.max(1, Math.round(interactionCount * 0.5)),
  };
  if (studentId) fields.student = [studentId];

  const attestation = { studentId, studentName: name, day, interactionCount, hash: hashPayload(fields) };
  fields['Session Notes'] = `${notes} · ${attestation.hash.slice(0, 16)}`;

  const tableId = sessionsTableId();
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...headers(apiKey), 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, typecast: true }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text.slice(0, 400) || 'TAWASUL_SEAL_FAILED');
  const row = JSON.parse(text);

  return {
    ok: true,
    alreadySealed: false,
    sealed: true,
    sessionDate: day,
    claimId: row?.id ?? null,
  };
}
