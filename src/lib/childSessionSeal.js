/**
 * Child Island → tblDailySessions seal bridge (AUN-4611 fairness trigger).
 * Server-only — direct Airtable REST (no browser airtable.js import).
 */

import { createHash } from 'crypto';
import { DAILY_SESSION as DS } from './airtableFields.js';
import { airtableConfigFromEnv, sanitizeAscii } from './paymentActivation.js';
import { CENTRAL_TABLES } from './centralAirtable.js';

export const CHILD_ISLAND_SEAL_THRESHOLD = 5;
export const ISLAND_SEAL_MARKER = 'AUN-4611 · Island World';
const CLAIM_STATUS_SEALED = 'Sealed';

function dailySessionsTableId() {
  return (
    sanitizeAscii(process.env.AIRTABLE_DAILY_SESSIONS_TABLE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID) ||
    CENTRAL_TABLES.dailySessions
  );
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function hashChildIslandSeal(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function airtableHeaders(apiKey) {
  return { Authorization: `Bearer ${sanitizeAscii(apiKey)}`, Accept: 'application/json' };
}

function sealedClaimsFormula(studentName, day) {
  const name = String(studentName).replace(/'/g, "\\'");
  return `AND({${DS.student_name}}='${name}',{${DS.claim_status}}='${CLAIM_STATUS_SEALED}',{${DS.session_date}}='${day}')`;
}

async function fetchSealedClaimsForDay(apiKey, baseId, studentName, day) {
  const tableId = dailySessionsTableId();
  const formula = encodeURIComponent(sealedClaimsFormula(studentName, day));
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?filterByFormula=${formula}`;
  const res = await fetch(url, { headers: airtableHeaders(apiKey) });
  if (!res.ok) return [];
  const data = await res.json();
  return data.records ?? [];
}

async function postSealedClaim(apiKey, baseId, fields) {
  const tableId = dailySessionsTableId();
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...airtableHeaders(apiKey), 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, typecast: true }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text.slice(0, 300) || 'AIRTABLE_POST_FAILED');
  return JSON.parse(text);
}

/** True if student already has a child-island sealed claim today. */
export async function hasChildIslandSealToday(studentName, config = airtableConfigFromEnv()) {
  const { apiKey, baseId } = config;
  if (!apiKey) return false;
  const day = todayIsoDate();
  const claims = await fetchSealedClaimsForDay(apiKey, baseId, studentName, day);
  return claims.some((row) => String(row?.fields?.[DS.notes] ?? '').includes(ISLAND_SEAL_MARKER));
}

/**
 * Seal daily session when child completes meaningful island interaction.
 * Idempotent: one island seal per student per calendar day.
 */
export async function sealSessionFromChildIsland({
  studentId,
  studentName,
  interactionCount = CHILD_ISLAND_SEAL_THRESHOLD,
  source = 'island_world',
  interactionType = 'play_engagement',
  config = airtableConfigFromEnv(),
}) {
  const name = String(studentName ?? '').trim();
  if (!name) throw new Error('STUDENT_NAME_REQUIRED');

  const { apiKey, baseId } = config;
  if (!apiKey) throw new Error('AIRTABLE_NOT_CONFIGURED');

  const day = todayIsoDate();
  if (await hasChildIslandSealToday(name, config)) {
    return { ok: true, alreadySealed: true, sessionDate: day };
  }

  const allToday = await fetchSealedClaimsForDay(apiKey, baseId, name, day);
  const sequence = allToday.length + 1;

  const attestationPayload = {
    trigger: 'CHILD_ISLAND',
    engine: 'AUN-4611',
    studentId: studentId ?? null,
    studentName: name,
    interactionCount,
    source,
    interactionType,
    sessionDate: day,
    sealedAt: new Date().toISOString(),
  };

  const signature = {
    method: 'CHILD_ISLAND_BRIDGE',
    payload: attestationPayload,
    signature: hashChildIslandSeal(attestationPayload).slice(0, 32),
  };
  const immutableHash = hashChildIslandSeal({ attestationPayload, signature });
  const notes = `${ISLAND_SEAL_MARKER} · ${source} · ${interactionType} · ${interactionCount} interactions · child verified`;

  const fields = {
    [DS.session_date]: day,
    [DS.specialist_name]: 'Aunak · Island Bridge',
    [DS.student_name]: name,
    [DS.notes]: notes,
    [DS.claim_status]: CLAIM_STATUS_SEALED,
    [DS.sealed_at]: new Date().toISOString(),
    [DS.session_sequence]: sequence,
    [DS.immutable_hash]: immutableHash,
    [DS.pin_verified]: false,
    [DS.specialist_signature]: JSON.stringify(signature),
  };

  const row = await postSealedClaim(apiKey, baseId, fields);

  return {
    ok: true,
    alreadySealed: false,
    sealed: true,
    sessionDate: day,
    sequence,
    claimId: row?.id ?? null,
    immutableHash,
  };
}
