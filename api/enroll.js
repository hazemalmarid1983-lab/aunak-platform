/**
 * POST /api/enroll — secure sovereign enrollment funnel.
 *
 * Composite Primary Key: national_id + English student_name.
 * Lookup keys on national_id; English name mismatch → 422 IDENTITY_MISMATCH.
 * Parents never submit diagnosis — presenting_symptoms + age only.
 */

import { STUDENT as SF } from '../src/lib/airtableFields.js';
import {
  buildNationalIdLookupFormula,
  normalizeNationalId,
  normalizeEnglishStudentName,
  resolveFunnelPhase,
  validateEnglishStudentName,
  validateNationalId,
  englishNamesMatch,
} from '../src/lib/enrollmentFunnel.js';
import { CENTRAL_BASE_ID, CENTRAL_TABLES } from '../src/lib/centralAirtable.js';

function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

function sanitizeDisplayName(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 120);
}

function sanitizeSymptoms(value) {
  return String(value ?? '')
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 800);
}

function airtableConfig() {
  const apiKey =
    sanitizeAscii(process.env.AIRTABLE_API_KEY) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_PAT) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_API_KEY) ||
    '';
  const baseId = sanitizeAscii(
    process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID || CENTRAL_BASE_ID
  ).split('/')[0];
  const studentsTable =
    sanitizeAscii(process.env.AIRTABLE_STUDENTS_TABLE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) ||
    CENTRAL_TABLES.students;
  return { apiKey, baseId, studentsTable };
}

async function airtableFetch(path, { method = 'GET', body } = {}) {
  const { apiKey, baseId } = airtableConfig();
  if (!apiKey) {
    const err = new Error('AIRTABLE_API_KEY_MISSING');
    err.status = 503;
    throw err;
  }
  const url = `https://api.airtable.com/v0/${baseId}/${path}`;
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data?.error?.message || data?.error || `AIRTABLE_${res.status}`);
    err.status = res.status;
    err.details = data;
    throw err;
  }
  return data;
}

function generateStudentCode(name, nationalId) {
  const base = sanitizeAscii(name)
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 4);
  const nid = String(nationalId || '')
    .replace(/[^A-Z0-9]/gi, '')
    .slice(-4)
    .toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `AUN-${base || 'STU'}${nid || '0000'}-${rand}`;
}

function pickRecordByNationalId(records, nationalId) {
  const nid = normalizeNationalId(nationalId);
  const list = Array.isArray(records) ? records : [];
  const record = list.find(
    (r) => normalizeNationalId(r.fields?.[SF.national_id] ?? r.fields?.national_id) === nid
  );
  return record ? { record, match: 'national_id' } : { record: null, match: null };
}

function publicFunnelPayload(record, { created = false, resumed = false, match = null, updated = false } = {}) {
  const fields = record?.fields ?? {};
  const funnel = resolveFunnelPhase(fields);
  return {
    ok: true,
    created,
    resumed,
    updated,
    match,
    recordId: record?.id ?? null,
    student_id: fields[SF.id] ?? fields.student_id ?? null,
    student_name: fields[SF.name] ?? fields.student_name ?? null,
    student_name_ar: fields[SF.student_name_ar] ?? fields.student_name_ar ?? null,
    national_id: fields[SF.national_id] ?? fields.national_id ?? null,
    funnel,
    fields: {
      subscription_status: fields[SF.subscription_status] ?? null,
      comprehensive_assessment_status: fields[SF.comprehensive_assessment_status] ?? null,
      initial_assessment_score: fields[SF.initial_assessment_score] ?? null,
      plan_code: fields[SF.plan_code] ?? null,
      preferred_destination: fields[SF.preferred_destination] ?? null,
      status: fields[SF.status] ?? null,
      age: fields[SF.age] ?? null,
      presenting_symptoms: fields[SF.presenting_symptoms] ?? null,
      screening_weights: fields[SF.screening_weights] ?? null,
      parent_phone: fields[SF.parent_phone] ?? null,
      child_interactive_token: fields[SF.child_interactive_token] ?? null,
      parent_access_token: fields[SF.parent_access_token] ?? null,
      biometric_status: fields[SF.biometric_status] ?? null,
      has_face_biometric: Boolean(String(fields[SF.face_biometric] ?? '').trim()),
      student_name_ar: fields[SF.student_name_ar] ?? null,
    },
  };
}

async function lookupByNationalId(nationalId) {
  const { studentsTable } = airtableConfig();
  const formula = buildNationalIdLookupFormula(nationalId);
  if (!formula) return [];
  const qs = new URLSearchParams({
    filterByFormula: formula,
    maxRecords: '5',
  });
  const data = await airtableFetch(`${encodeURIComponent(studentsTable)}?${qs}`);
  return Array.isArray(data.records) ? data.records : [];
}

function buildEnrollmentFields({
  studentName,
  studentNameAr,
  nationalId,
  studentCode,
  age,
  presentingSymptoms,
  parentPhone,
  parentCountryCode,
  preferredLanding,
  includeDefaults = true,
} = {}) {
  const fields = {
    [SF.name]: studentName,
    [SF.national_id]: nationalId,
  };
  const ar = sanitizeDisplayName(studentNameAr);
  if (ar) fields[SF.student_name_ar] = ar;

  if (includeDefaults) {
    if (studentCode) fields[SF.id] = studentCode;
    fields[SF.status] = 'new';
    fields[SF.subscription_status] = 'pending';
    fields[SF.comprehensive_assessment_status] = 'not_started';
    fields[SF.preferred_destination] = preferredLanding || 'live';
    // Clinician-owned placeholder — never parent-selected diagnosis
    fields[SF.diagnosis] = 'under_assessment';
  } else {
    if (preferredLanding) fields[SF.preferred_destination] = preferredLanding;
  }

  if (Number.isFinite(age)) fields[SF.age] = age;
  if (presentingSymptoms) fields[SF.presenting_symptoms] = presentingSymptoms;
  if (parentPhone) fields[SF.parent_phone] = parentPhone;
  if (parentCountryCode) fields[SF.parent_country_code] = parentCountryCode;
  return fields;
}

/** PATCH; drop unknown optional columns and retry. */
async function patchStudentRecord(recordId, fields) {
  const { studentsTable } = airtableConfig();
  const path = `${encodeURIComponent(studentsTable)}/${encodeURIComponent(recordId)}`;
  const droppable = [SF.student_name_ar, SF.presenting_symptoms, SF.screening_weights];

  const attempt = async (payload) =>
    airtableFetch(path, {
      method: 'PATCH',
      body: { fields: payload, typecast: true },
    });

  try {
    return await attempt(fields);
  } catch (err) {
    const msg = String(err?.message || '');
    const detail = JSON.stringify(err?.details || {});
    let next = { ...fields };
    let dropped = false;
    for (const key of droppable) {
      if (next[key] && (msg.includes('UNKNOWN_FIELD_NAME') || detail.includes(key))) {
        delete next[key];
        dropped = true;
      }
    }
    if (dropped) return attempt(next);
    throw err;
  }
}

async function createStudentRecord(fields) {
  const { studentsTable } = airtableConfig();
  const droppable = [SF.student_name_ar, SF.presenting_symptoms, SF.screening_weights];

  const attempt = async (payload) =>
    airtableFetch(encodeURIComponent(studentsTable), {
      method: 'POST',
      body: { fields: payload, typecast: true },
    });

  try {
    return await attempt(fields);
  } catch (err) {
    const msg = String(err?.message || '');
    const detail = JSON.stringify(err?.details || {});
    let next = { ...fields };
    let dropped = false;
    for (const key of droppable) {
      if (next[key] && (msg.includes('UNKNOWN_FIELD_NAME') || detail.includes(key))) {
        delete next[key];
        dropped = true;
      }
    }
    if (dropped) return attempt(next);
    throw err;
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const body = req.body ?? {};
    const action = String(body.action ?? 'enroll').trim().toLowerCase();

    const nationalCheck = validateNationalId(body.national_id ?? body.nationalId);
    const nameCheck = validateEnglishStudentName(body.student_name ?? body.studentName ?? body.name);
    if (!nationalCheck.ok || !nameCheck.ok) {
      res.status(400).json({
        error: 'IDENTITY_VALIDATION_FAILED',
        national_id: nationalCheck.message,
        student_name: nameCheck.message,
      });
      return;
    }

    const nationalId = nationalCheck.value;
    const studentName = nameCheck.value;
    const studentNameAr = sanitizeDisplayName(
      body.student_name_ar ?? body.studentNameAr ?? body.name_ar ?? body.nameAr ?? ''
    );

    if (action === 'lookup' || action === 'resume') {
      const records = await lookupByNationalId(nationalId);
      const { record, match } = pickRecordByNationalId(records, nationalId);
      if (!record) {
        res.status(404).json({ ok: false, error: 'NOT_FOUND', resumed: false });
        return;
      }
      const existingName = record.fields?.[SF.name] ?? record.fields?.student_name ?? '';
      if (existingName && !englishNamesMatch(existingName, studentName)) {
        res.status(422).json({
          ok: false,
          error: 'IDENTITY_MISMATCH',
          message:
            'national_id already bound to a different English student_name — composite primary key conflict',
          national_id: nationalId,
          expected_student_name: existingName,
        });
        return;
      }
      res.status(200).json(publicFunnelPayload(record, { resumed: true, match }));
      return;
    }

    const existing = await lookupByNationalId(nationalId);
    const { record: found, match } = pickRecordByNationalId(existing, nationalId);

    const age = body.age != null && body.age !== '' ? Number(body.age) : null;
    const presentingSymptoms = sanitizeSymptoms(
      body.presenting_symptoms ?? body.symptoms ?? body.presentingSymptoms ?? ''
    );
    const parentPhone = String(body.parent_phone ?? body.parentPhone ?? '').trim();
    const parentCountryCode = String(body.parent_country_code ?? body.parentCountryCode ?? '').trim();
    const preferredLanding = String(
      body.preferred_destination ?? body.preferredLanding ?? 'live'
    ).trim() || 'live';

    if (found?.id) {
      const existingName = found.fields?.[SF.name] ?? found.fields?.student_name ?? '';
      if (existingName && !englishNamesMatch(existingName, studentName)) {
        res.status(422).json({
          ok: false,
          error: 'IDENTITY_MISMATCH',
          message:
            'national_id + English student_name primary key conflict — refuse duplicate row',
          national_id: nationalId,
          expected_student_name: existingName,
        });
        return;
      }

      const patchFields = buildEnrollmentFields({
        studentName,
        studentNameAr,
        nationalId,
        age,
        presentingSymptoms,
        parentPhone,
        parentCountryCode,
        preferredLanding,
        includeDefaults: false,
      });
      const updated = await patchStudentRecord(found.id, patchFields);
      res.status(200).json(
        publicFunnelPayload(updated, {
          created: false,
          resumed: true,
          updated: true,
          match: match || 'national_id',
        })
      );
      return;
    }

    const studentCode =
      String(body.student_id ?? body.studentCode ?? '').trim() ||
      generateStudentCode(studentName, nationalId);

    const fields = buildEnrollmentFields({
      studentName,
      studentNameAr,
      nationalId,
      studentCode,
      age,
      presentingSymptoms,
      parentPhone,
      parentCountryCode,
      preferredLanding,
      includeDefaults: true,
    });

    const created = await createStudentRecord(fields);

    res.status(201).json(
      publicFunnelPayload(created, {
        created: true,
        resumed: false,
        updated: false,
        match: null,
      })
    );
  } catch (err) {
    const status = err?.status && Number.isFinite(err.status) ? err.status : 500;
    console.error('[api/enroll]', err?.message, err?.details);
    res.status(status).json({
      error: err?.message || 'ENROLL_FAILED',
      details: err?.details?.error ?? undefined,
    });
  }
}
