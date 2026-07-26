/* global process */
import { b2gChildCode } from '../_handlers/b2g/anonymize.js';
import { mapStudentToB2GView } from '../../src/lib/b2gAnonymization.js';
import { STUDENT as SF } from '../../src/lib/airtableFields.js';

const UDI_CODE = /^CHD-[A-F0-9]{4}$/;
const DEFAULT_BASE_ID = 'appcjitgWsbvIebwf';
const DEFAULT_STUDENTS_TABLE_ID = 'tblTidBPaVM4cf3O9';
const PUBLIC_FIELDS = [
  SF.harmony_score,
  SF.behavior_intensity,
  SF.focus_level,
  SF.comprehensive_assessment_status,
  SF.initial_assessment_score,
];

function cleanEnv(value) {
  return String(value ?? '')
    .trim()
    .replace(/^Bearer\s+/i, '')
    .replace(/^(['"])(.*)\1$/, '$2');
}

async function findStudentByCode({ apiKey, baseId, tableId, requestedCode }) {
  let offset = '';

  do {
    const params = new URLSearchParams({ pageSize: '100' });
    PUBLIC_FIELDS.forEach((field) => params.append('fields[]', field));
    if (offset) params.set('offset', offset);

    const response = await fetch(
      `https://api.airtable.com/v0/${baseId}/${tableId}?${params.toString()}`,
      { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } }
    );
    if (!response.ok) {
      throw new Error(`Airtable UDI lookup failed (${response.status})`);
    }

    const page = await response.json();
    const record = (page.records ?? []).find((row) => b2gChildCode(row.id) === requestedCode);
    if (record) return record;
    offset = page.offset ?? '';
  } while (offset);

  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'METHOD_NOT_ALLOWED' });
    return;
  }

  const requestedCode = String(req.query?.code ?? '').trim().toUpperCase();
  if (!UDI_CODE.test(requestedCode)) {
    res.status(400).json({ error: 'INVALID_UDI_CODE' });
    return;
  }

  const apiKey = cleanEnv(
    process.env.AIRTABLE_API_KEY ||
      process.env.VITE_AIRTABLE_PAT ||
      process.env.VITE_AIRTABLE_API_KEY
  );
  if (!apiKey) {
    res.status(503).json({ error: 'UDI_SERVICE_NOT_CONFIGURED' });
    return;
  }

  try {
    const record = await findStudentByCode({
      apiKey,
      baseId: cleanEnv(process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID) || DEFAULT_BASE_ID,
      tableId:
        cleanEnv(
          process.env.AIRTABLE_STUDENTS_TABLE_ID ||
            process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID
        ) || DEFAULT_STUDENTS_TABLE_ID,
      requestedCode,
    });

    if (!record) {
      res.status(404).json({ error: 'UDI_NOT_FOUND' });
      return;
    }

    const view = mapStudentToB2GView({
      ...record,
      fields: { ...record.fields, b2g_child_code: requestedCode },
    });
    res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json({
      b2gCode: view.b2gCode,
      harmonyScore: view.harmonyScore,
      riskScore: view.riskScore,
      comprehensiveAssessmentStatus: view.comprehensiveAssessmentStatus ?? null,
      initialAssessmentScore: view.initialAssessmentScore,
    });
  } catch (error) {
    console.error('[udi] Public passport lookup failed:', error);
    res.status(502).json({ error: 'UDI_LOOKUP_FAILED' });
  }
}
