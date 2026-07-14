/**
 * POST /api/tawasul/verify-token
 * Server-side token verify — runtime env (base + table + PAT), not client build IDs.
 * AUN-SPC-* → Specialists.specialist_tutor_token
 * AUN-CHD-* → Students.child_interactive_token
 */

import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';
import { SPECIALIST as SP, STUDENT as SF } from '../../../src/lib/airtableFields.js';
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

async function findRecordByTokenField(apiKey, baseId, tableId, fieldName, token) {
  const key = normalizeToken(token);
  const esc = key.replace(/'/g, "\\'");
  // Case-insensitive match — stored tokens may be mixed-case (e.g. AUN-CHD-alhusain-2026)
  const formula = encodeURIComponent(`LOWER({${fieldName}})=LOWER('${esc}')`);
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
      (r) => normalizeToken(pickField(r.fields, fieldName)) === key
    ) ?? null
  );
}

/** Accept active / B2B_PREMIUM / نشط — reject only explicit inactive. */
function isChildRecordActivated(fields) {
  const status = String(pickField(fields, SF.status, 'status', 'Status') ?? '').toLowerCase();
  const subscription = String(
    pickField(
      fields,
      SF.subscription_status,
      'subscription_status',
      'Payment_Status',
      'payment_status'
    ) ?? ''
  ).toLowerCase();

  if (/inactive|disabled|معطل|موقوف/.test(status)) return false;
  if (/expired|منته|lapsed/.test(subscription)) return false;

  // Token gate: any non-inactive record with a child token is allowed.
  // Explicit active / premium / B2B tags also pass.
  if (/active|نشط|مفعل|فعال|b2b_premium|premium/.test(subscription)) return true;
  if (/active|نشط|مفعل|فعال|b2b_premium|premium|new|جديد/.test(status)) return true;
  return Boolean(pickField(fields, SF.child_interactive_token, 'child_interactive_token'));
}

function buildSpecialistSession(record, token) {
  const f = record.fields ?? {};
  const status = String(pickField(f, SP.status, 'status') ?? 'active').toLowerCase();
  if (/inactive|disabled|معطل/.test(status)) return null;

  return {
    role: 'specialist',
    // Tawasul merges all sovereign packages — top tier + manual override unlock everything.
    plan: 'institution',
    manualOverride: true,
    accessLevel: 'sovereign',
    name: pickField(f, SP.name, 'Name', 'specialist_name') || 'أخصائي',
    email: pickField(f, SP.email, 'Email', 'professional_email') || '',
    specialistRecordId: record.id,
    specialistToken: normalizeToken(token),
    tawasulMvp: true,
    landingSection: 'registry',
    dynamicSessionId: `TWS-${Date.now().toString(36)}`,
  };
}

function buildChildPayload(record, token) {
  const f = record.fields ?? {};
  if (!isChildRecordActivated(f)) return null;

  return {
    id: record.id,
    fields: f,
    childInteractiveToken: normalizeToken(
      pickField(f, SF.child_interactive_token, 'child_interactive_token') || token
    ),
  };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const token = sanitizeAscii(
    req.body?.token ?? req.body?.specialist_tutor_token ?? req.body?.child_interactive_token
  );
  if (!token) {
    res.status(400).json({ error: 'TOKEN_REQUIRED' });
    return;
  }

  const isSpecialist = /^AUN-SPC-/i.test(token);
  const isChild = /^AUN-CHD-/i.test(token);
  if (!isSpecialist && !isChild) {
    res.status(400).json({ error: 'INVALID_TOKEN_FORMAT' });
    return;
  }

  const { apiKey, baseId, specialistsTable, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  try {
    if (isSpecialist) {
      const record = await findRecordByTokenField(
        apiKey,
        baseId,
        specialistsTable,
        SP.specialist_tutor_token,
        token
      );
      if (!record) {
        res.status(401).json({
          error: 'TOKEN_NOT_FOUND',
          hint: 'Check Specialists.specialist_tutor_token',
          baseId,
          table: specialistsTable,
        });
        return;
      }

      const session = buildSpecialistSession(record, token);
      if (!session) {
        res.status(403).json({ error: 'SPECIALIST_INACTIVE' });
        return;
      }

      res.status(200).json({ ok: true, kind: 'specialist', session });
      return;
    }

    const record = await findRecordByTokenField(
      apiKey,
      baseId,
      studentsTable,
      SF.child_interactive_token,
      token
    );
    if (!record) {
      res.status(401).json({
        error: 'TOKEN_NOT_FOUND',
        hint: 'Check Students.child_interactive_token',
        baseId,
        table: studentsTable,
      });
      return;
    }

    const student = buildChildPayload(record, token);
    if (!student) {
      res.status(403).json({ error: 'STUDENT_INACTIVE' });
      return;
    }

    res.status(200).json({ ok: true, kind: 'child', record: student });
  } catch (err) {
    console.error('[tawasul/verify-token]', err?.message);
    res.status(502).json({ error: err?.message ?? 'VERIFY_FAILED' });
  }
}
