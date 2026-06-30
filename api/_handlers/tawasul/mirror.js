/**
 * POST /api/tawasul/mirror
 */

import { buildTawasulMirrorPatch } from '../../../src/lib/tawasulStudentFields.js';
import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';
import { formatAirtableApiError } from './airtableError.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const studentId = sanitizeAscii(req.body?.studentId);
  const command = sanitizeAscii(req.body?.command);
  const payload = sanitizeAscii(req.body?.payload ?? '');
  const goalEcho = req.body?.goalEcho;

  if (!studentId || !command) {
    res.status(400).json({ error: 'STUDENT_ID_AND_COMMAND_REQUIRED' });
    return;
  }

  const { apiKey, baseId, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  const fields = buildTawasulMirrorPatch(command, payload, goalEcho);
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${studentId}`;

  try {
    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: airtableHeaders(apiKey, { write: true }),
      body: JSON.stringify({ fields, typecast: true }),
    });
    const text = await patchRes.text();
    if (!patchRes.ok) throw new Error(formatAirtableApiError(patchRes.status, text));
    res.status(200).json({ ok: true, command, payload, table: studentsTable });
  } catch (err) {
    const message = err?.message ?? 'MIRROR_FAILED';
    const status = String(message).includes('403') ? 403 : 500;
    res.status(status).json({ error: message });
  }
}
