/**
 * POST /api/tawasul/verify-token
 * Server-side specialist login — runtime env (base + table + PAT), not client build IDs.
 */

import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';
import { SPECIALIST as SP } from '../../../src/lib/airtableFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

function pickField(fields, ...keys) {
  if (!fields) return null;
  for (const key of keys) {
    const v = fields[key];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return null;
}

async function airtableGet(url, apiKey) {
  const res = await fetch(url, { headers: airtableHeaders(apiKey) });
  const text = await res.text();
  if (!res.ok) throw new Error(`AIRTABLE_${res.status}:${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

async function findSpecialistRecord(apiKey, baseId, tableId, token) {
  const key = normalizeToken(token);
  const esc = key.replace(/'/g, "\\'");
  const formula = encodeURIComponent(`{specialist_tutor_token}='${esc}'`);
  const filteredUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?filterByFormula=${formula}&maxRecords=1`;

  try {
    const data = await airtableGet(filteredUrl, apiKey);
    if (data.records?.[0]) return data.records[0];
  } catch (err) {
    if (!String(err?.message ?? '').includes('422')) throw err;
  }

  const listUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?maxRecords=100`;
  const data = await airtableGet(listUrl, apiKey);
  return (
    (data.records ?? []).find(
      (r) => normalizeToken(pickField(r.fields, SP.specialist_tutor_token, 'specialist_tutor_token')) === key
    ) ?? null
  );
}

function buildSession(record, token) {
  const f = record.fields ?? {};
  const status = String(pickField(f, SP.status, 'status') ?? 'active').toLowerCase();
  if (/inactive|disabled|معطل/.test(status)) return null;

  return {
    role: 'specialist',
    plan: 'tutor',
    name: pickField(f, SP.name, 'Name', 'specialist_name') || 'أخصائي',
    email: pickField(f, SP.email, 'Email', 'professional_email') || '',
    specialistRecordId: record.id,
    specialistToken: normalizeToken(token),
    tawasulMvp: true,
    landingSection: 'registry',
    dynamicSessionId: `TWS-${Date.now().toString(36)}`,
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = sanitizeAscii(req.body?.token ?? req.body?.specialist_tutor_token);
  if (!token || !/^AUN-SPC-/i.test(token)) {
    res.status(400).json({ error: 'INVALID_TOKEN_FORMAT' });
    return;
  }

  const { apiKey, baseId, specialistsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  try {
    const record = await findSpecialistRecord(apiKey, baseId, specialistsTable, token);
    if (!record) {
      res.status(401).json({
        error: 'TOKEN_NOT_FOUND',
        hint: 'Check Specialists table on configured base',
        baseId,
        specialistsTable,
      });
      return;
    }

    const session = buildSession(record, token);
    if (!session) {
      res.status(403).json({ error: 'SPECIALIST_INACTIVE' });
      return;
    }

    res.status(200).json({ ok: true, session });
  } catch (err) {
    console.error('[tawasul/verify-token]', err?.message);
    res.status(502).json({ error: err?.message ?? 'VERIFY_FAILED' });
  }
}
