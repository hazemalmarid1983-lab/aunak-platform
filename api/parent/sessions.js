/**
 * GET /api/parent/sessions?studentName=...&days=90
 * Server-side Daily Sessions fetch — uses AIRTABLE_API_KEY (not browser PAT).
 */

import { DAILY_SESSION as DS, STUDENT as SF } from '../../src/lib/airtableFields.js';

const DEFAULT_BASE_ID = 'appaGfKj4vYhMw0cb';
const DEFAULT_DAILY_SESSIONS_TABLE_ID = 'tbl3mlewMLvqp6AXB';
const CLAIM_STATUS_SEALED = 'Sealed';

function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

function resolveTableId() {
  for (const key of ['AIRTABLE_DAILY_SESSIONS_TABLE_ID', 'VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID']) {
    const raw = process.env[key];
    const cleaned = sanitizeAscii(raw);
    if (/^tbl[a-zA-Z0-9]{10,}$/i.test(cleaned)) return cleaned;
  }
  return DEFAULT_DAILY_SESSIONS_TABLE_ID;
}

function resolveBaseId() {
  const raw = process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID || DEFAULT_BASE_ID;
  return sanitizeAscii(raw).split('/')[0] || DEFAULT_BASE_ID;
}

function resolveApiKey() {
  return sanitizeAscii(process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT);
}

function normalizeDate(date) {
  if (!date) return new Date().toISOString().slice(0, 10);
  const s = String(date).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function mapRecord(record) {
  const f = record?.fields ?? {};
  return {
    id: record?.id ?? null,
    sessionDate: f[DS.session_date] ?? '',
    specialistName: String(f[DS.specialist_name] ?? '').trim(),
    studentName: String(f[DS.student_name] ?? '').trim(),
    notes: String(f[DS.notes] ?? '').trim(),
    sealedAt: f[DS.sealed_at] ?? null,
    sessionSequence: f[DS.session_sequence] ?? null,
    claimStatus: f[DS.claim_status] ?? CLAIM_STATUS_SEALED,
    pinVerified: Boolean(f[DS.pin_verified]),
    source: 'daily_sessions',
  };
}

function sealedFormula(studentName, startDate, endDate) {
  const name = String(studentName).replace(/'/g, "\\'");
  return (
    'AND({' +
    DS.student_name +
    "}='" +
    name +
    "', {" +
    DS.claim_status +
    "}='" +
    CLAIM_STATUS_SEALED +
    "', {" +
    DS.session_date +
    ">='" +
    startDate +
    "', {" +
    DS.session_date +
    "<='" +
    endDate +
    "')"
  );
}

async function fetchAllPages(baseId, tableId, apiKey, params) {
  const all = [];
  let offset;
  do {
    const qs = new URLSearchParams(params);
    if (offset) qs.set('offset', offset);
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?${qs.toString()}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' },
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => '');
      const err = new Error(`Airtable ${res.status}${detail ? `: ${detail}` : ''}`);
      err.status = res.status;
      throw err;
    }
    const page = await res.json();
    if (Array.isArray(page.records)) all.push(...page.records);
    offset = page.offset;
  } while (offset);
  return all;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const studentName = String(req.query?.studentName ?? '').trim();
  const days = Math.min(365, Math.max(1, Number(req.query?.days) || 90));

  if (!studentName) {
    res.status(400).json({ error: 'Missing studentName query parameter' });
    return;
  }

  const apiKey = resolveApiKey();
  if (!apiKey) {
    res.status(200).json({ sessions: [], source: 'none', reason: 'AIRTABLE_API_KEY not configured' });
    return;
  }

  const baseId = resolveBaseId();
  const tableId = resolveTableId();
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days + 1);
  const startDate = normalizeDate(start.toISOString());
  const endDate = normalizeDate(end.toISOString());

  try {
    const formula = sealedFormula(studentName, startDate, endDate);
    const records = await fetchAllPages(baseId, tableId, apiKey, {
      filterByFormula: formula,
      pageSize: '100',
    });

    const sessions = records
      .map(mapRecord)
      .sort((a, b) => {
        const da = String(a.sessionDate ?? '');
        const db = String(b.sessionDate ?? '');
        if (da !== db) return db.localeCompare(da);
        return (b.sessionSequence ?? 0) - (a.sessionSequence ?? 0);
      });

    res.status(200).json({
      sessions,
      source: 'daily_sessions',
      tableId,
      count: sessions.length,
    });
  } catch (err) {
    const status = err?.status ?? 502;
    res.status(200).json({
      sessions: [],
      source: 'unavailable',
      tableId,
      reason: status === 403 ? 'table_not_found_or_forbidden' : 'fetch_failed',
      detail: String(err?.message ?? err).slice(0, 240),
    });
  }
}
