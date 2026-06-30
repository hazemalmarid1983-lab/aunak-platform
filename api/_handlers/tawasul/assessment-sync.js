/**
 * POST /api/tawasul/assessment-sync
 */

import {
  generateProgrammedGoalFromAssessment,
  shouldAutoInjectGoal,
} from '../../../src/lib/tawasulAssessmentEngine.js';
import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';
import { formatAirtableApiError } from './airtableError.js';

async function patchStudent(apiKey, baseId, tableId, recordId, fields) {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}/${recordId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: airtableHeaders(apiKey, { write: true }),
    body: JSON.stringify({ fields, typecast: true }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(formatAirtableApiError(res.status, text));
  return JSON.parse(text);
}

async function findStudentByName(apiKey, baseId, tableId, name) {
  const n = String(name).replace(/'/g, "\\'");
  const formula = encodeURIComponent(`{Name}='${n}'`);
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?filterByFormula=${formula}&maxRecords=1`;
  const res = await fetch(url, { headers: airtableHeaders(apiKey) });
  if (!res.ok) return null;
  const data = await res.json();
  return data.records?.[0] ?? null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { apiKey, baseId, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  const recordId = sanitizeAscii(req.body?.recordId);
  const studentName = sanitizeAscii(req.body?.studentName ?? req.body?.student_name ?? req.body?.Name);
  const fieldsIn = req.body?.fields ?? req.body ?? {};

  try {
    let record = recordId ? { id: recordId, fields: fieldsIn } : null;
    if (!record && studentName) record = await findStudentByName(apiKey, baseId, studentsTable, studentName);
    if (!record?.id) {
      res.status(400).json({ error: 'STUDENT_NOT_FOUND' });
      return;
    }

    const merged = { ...record.fields, ...fieldsIn };
    const name = merged.Name ?? merged.student_name ?? studentName ?? 'الطفل';
    const patch = { ...fieldsIn };

    if (shouldAutoInjectGoal(merged)) {
      const goal = generateProgrammedGoalFromAssessment({
        studentName: name,
        scoreRaw: merged.initial_assessment_score ?? merged.Initial_Assessment_Score,
        comprehensiveStatus:
          merged.comprehensive_assessment_status ??
          merged.Comprehensive_Assessment_Status ??
          'completed',
        lang: 'ar',
      });
      if (goal) {
        patch.programmed_goal = goal;
        patch.comprehensive_assessment_status = 'completed';
      }
    }

    const updated = await patchStudent(apiKey, baseId, studentsTable, record.id, patch);
    res.status(200).json({
      ok: true,
      recordId: updated.id,
      programmed_goal: updated.fields?.programmed_goal ?? null,
      autoGoal: Boolean(patch.programmed_goal),
    });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'ASSESSMENT_SYNC_FAILED' });
  }
}
