/**
 * POST /api/tawasul/caseload
 * Specialist dashboard — self-contained server handler (no src/lib/airtable import).
 */

import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';
import { SPECIALIST as SP } from '../../../src/lib/airtableFields.js';
import { TAWASUL_MAX_CASES_PER_SPECIALIST } from '../../../src/lib/tawasulConfig.js';
import { readTawasulProgrammedGoal, TAWASUL_STUDENT } from '../../../src/lib/tawasulStudentFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';

const MAX_CASES = TAWASUL_MAX_CASES_PER_SPECIALIST ?? 5;

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

function pickField(fields, ...keys) {
  if (!fields || typeof fields !== 'object') return null;
  for (const key of keys) {
    const v = fields[key];
    if (v != null && String(v).trim() !== '') return String(v).trim();
  }
  return null;
}

function toIdList(raw) {
  if (raw == null || raw === '') return [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list
    .map((v) => (typeof v === 'string' ? v : v?.id))
    .filter((id) => id && /^rec[a-zA-Z0-9]{10,}$/.test(String(id)));
}

/** Safe read of Specialists → Students link (any casing / empty). */
function linkedStudentIdsFromSpecialist(specialistRecord) {
  const fields = specialistRecord?.fields;
  if (!fields || typeof fields !== 'object') return [];
  const raw =
    fields?.Students ??
    fields?.students ??
    fields?.[SP.students] ??
    fields?.assigned_specialist ??
    null;
  return toIdList(raw);
}

function mapStudentLite(record) {
  const f = record?.fields ?? {};
  return {
    id: record?.id ?? null,
    name: pickField(f, TAWASUL_STUDENT.name, 'Name', 'student_name', 'name') || 'طالب',
    childInteractiveToken:
      pickField(f, TAWASUL_STUDENT.childInteractiveToken, 'child_interactive_token') || null,
    programmedGoal: readTawasulProgrammedGoal(f) || '',
    assignedSpecialistIds: toIdList(f?.assigned_specialist ?? f?.[TAWASUL_STUDENT.assignedSpecialist]),
    fields: f,
  };
}

function resolveCaseloadRows(allRecords, specialistRecord, specialistRecordId) {
  const mapped = (Array.isArray(allRecords) ? allRecords : [])
    .filter((r) => r?.id)
    .map(mapStudentLite);

  const linkedIds = linkedStudentIdsFromSpecialist(specialistRecord);
  if (linkedIds.length > 0) {
    const idSet = new Set(linkedIds);
    return mapped.filter((s) => s.id && idSet.has(s.id)).slice(0, MAX_CASES);
  }

  if (specialistRecordId) {
    const byAssigned = mapped
      .filter((s) => toIdList(s?.fields?.assigned_specialist ?? s?.assignedSpecialistIds).includes(specialistRecordId))
      .slice(0, MAX_CASES);
    if (byAssigned.length > 0) return byAssigned;
  }

  return [];
}

async function airtableGet(url, apiKey) {
  const res = await fetch(url, { headers: airtableHeaders(apiKey) });
  const text = await res.text();
  if (!res.ok) throw new Error(`AIRTABLE_${res.status}:${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : {};
}

async function fetchSpecialistById(apiKey, baseId, tableId, recordId) {
  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}/${recordId}`;
    return await airtableGet(url, apiKey);
  } catch (err) {
    if (String(err?.message ?? '').includes('AIRTABLE_404')) return null;
    throw err;
  }
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
        normalizeToken(pickField(r?.fields, SP.specialist_tutor_token, 'specialist_tutor_token')) === key
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
    res.status(400).json({ ok: false, error: 'SPECIALIST_ID_OR_TOKEN_REQUIRED', students: [] });
    return;
  }

  const { apiKey, baseId, specialistsTable, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ ok: false, error: 'AIRTABLE_NOT_CONFIGURED', students: [] });
    return;
  }

  try {
    let specialistRecord = null;

    if (!specialistRecordId && specialistToken) {
      if (!/^AUN-SPC-/i.test(specialistToken)) {
        res.status(400).json({ ok: false, error: 'INVALID_SPECIALIST_TOKEN_FORMAT', students: [] });
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
          ok: false,
          error: 'SPECIALIST_NOT_FOUND',
          hint: 'Check Specialists.specialist_tutor_token',
          baseId,
          table: specialistsTable,
          students: [],
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
    const students = resolveCaseloadRows(records, specialistRecord, specialistRecordId);
    const linkedStudentIds = linkedStudentIdsFromSpecialist(specialistRecord);

    res.status(200).json({
      ok: true,
      specialistRecordId: specialistRecordId ?? null,
      linkedStudentIds,
      count: students.length,
      students,
    });
  } catch (err) {
    console.error('[tawasul/caseload]', err?.message ?? err);
    res.status(502).json({
      ok: false,
      error: err?.message ?? 'CASELOAD_FAILED',
      students: [],
    });
  }
}
