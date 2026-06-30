/**
 * POST /api/tawasul/caseload
 * Specialist dashboard — students linked via Specialists.Students (live Tawasul schema).
 */

import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';
import { SPECIALIST as SP } from '../../../src/lib/airtableFields.js';
import { mapStudent } from '../../../src/lib/airtableMappers.js';
import {
  linkedStudentIdsFromSpecialistRecord,
  resolveSpecialistCaseload,
} from '../../../src/lib/specialistIsolation.js';
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

async function fetchSpecialistById(apiKey, baseId, tableId, recordId) {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}/${recordId}`;
  return airtableGet(url, apiKey);
}

async function findSpecialistByToken(apiKey, baseId, tableId, token) {
  const key = normalizeToken(token);
  const esc = key.replace(/'/g, "\\'");
  const formula = encodeURIComponent(`{${SP.specialist_tutor_token}}='${esc}'`);
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
      (r) =>
        normalizeToken(pickField(r.fields, SP.specialist_tutor_token, 'specialist_tutor_token')) === key
    ) ?? null
  );
}

async function fetchStudentRecords(apiKey, baseId, tableId) {
  const records = [];
  let offset;
  do {
    const offsetQs = offset ? `&offset=${encodeURIComponent(offset)}` : '';
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?pageSize=100${offsetQs}`;
    const data = await airtableGet(url, apiKey);
    records.push(...(data.records ?? []));
    offset = data.offset;
  } while (offset);
  return records;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const specialistToken = sanitizeAscii(
    req.body?.specialistToken ?? req.body?.specialist_tutor_token ?? req.body?.token
  );
  let specialistRecordId = sanitizeAscii(req.body?.specialistRecordId);

  if (!specialistRecordId && !specialistToken) {
    res.status(400).json({ error: 'SPECIALIST_ID_OR_TOKEN_REQUIRED' });
    return;
  }

  const { apiKey, baseId, specialistsTable, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  try {
    let specialistRecord = null;

    if (!specialistRecordId && specialistToken) {
      if (!/^AUN-SPC-/i.test(specialistToken)) {
        res.status(400).json({ error: 'INVALID_SPECIALIST_TOKEN_FORMAT' });
        return;
      }
      specialistRecord = await findSpecialistByToken(
        apiKey,
        baseId,
        specialistsTable,
        specialistToken
      );
      if (!specialistRecord) {
        res.status(401).json({
          error: 'SPECIALIST_NOT_FOUND',
          hint: 'Check Specialists.specialist_tutor_token',
          baseId,
          table: specialistsTable,
        });
        return;
      }
      specialistRecordId = specialistRecord.id;
    } else if (specialistRecordId) {
      specialistRecord = await fetchSpecialistById(
        apiKey,
        baseId,
        specialistsTable,
        specialistRecordId
      );
    }

    const records = await fetchStudentRecords(apiKey, baseId, studentsTable);
    const mapped = records.map((r) => mapStudent(r, 'ar'));
    const caseload = resolveSpecialistCaseload(
      mapped,
      {
        specialistRecordId,
        specialistToken: normalizeToken(specialistToken),
      },
      specialistRecord
    );

    const students = caseload.map((s) => {
      const f = s.fields ?? {};
      return {
        id: s.id,
        name: s.name || pickField(f, 'Name', 'student_name') || 'طالب',
        childInteractiveToken:
          s.childInteractiveToken || pickField(f, 'child_interactive_token') || null,
        programmedGoal: s.programmedGoal || pickField(f, 'programmed_goal') || '',
        assignedSpecialistIds: s.assignedSpecialistIds ?? f.assigned_specialist ?? [],
        fields: f,
      };
    });

    res.status(200).json({
      ok: true,
      specialistRecordId,
      linkedStudentIds: linkedStudentIdsFromSpecialistRecord(specialistRecord),
      count: students.length,
      students,
    });
  } catch (err) {
    console.error('[tawasul/caseload]', err?.message);
    res.status(502).json({ error: err?.message ?? 'CASELOAD_FAILED' });
  }
}
