/**
 * POST /api/tawasul/student-goal — save programmed_goal only (no assessment engine import).
 */

import { STUDENT as SF } from '../../../src/lib/airtableFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';
import { formatAirtableApiError } from './airtableError.js';
import { sanitizeGoalText, sanitizeRecordId } from './sanitize.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const recordId = sanitizeRecordId(req.body?.recordId ?? req.body?.studentId);
  const goal = sanitizeGoalText(
    req.body?.programmedGoal ??
      req.body?.programmed_goal ??
      req.body?.fields?.programmed_goal ??
      req.body?.goal
  );

  if (!recordId) {
    res.status(400).json({ error: 'RECORD_ID_REQUIRED' });
    return;
  }
  if (!goal) {
    res.status(400).json({ error: 'GOAL_TEXT_REQUIRED' });
    return;
  }

  const { apiKey, baseId, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${recordId}`;

  try {
    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: airtableHeaders(apiKey, { write: true }),
      body: JSON.stringify({ fields: { [SF.programmed_goal]: goal }, typecast: true }),
    });
    const text = await patchRes.text();
    if (!patchRes.ok) throw new Error(formatAirtableApiError(patchRes.status, text));
    const updated = JSON.parse(text);
    res.status(200).json({
      ok: true,
      recordId: updated.id,
      programmed_goal: updated.fields?.[SF.programmed_goal] ?? goal,
    });
  } catch (err) {
    const message = err?.message ?? 'STUDENT_GOAL_SAVE_FAILED';
    console.error('[tawasul/student-goal]', message);
    res.status(500).json({ error: message });
  }
}
