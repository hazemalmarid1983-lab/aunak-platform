/**
 * POST /api/tawasul/mirror
 */

import { buildMirrorPatch } from '../../../src/lib/tawasulMirror.js';
import { sanitizeAscii } from '../../../src/lib/paymentActivation.js';
import { STUDENT as SF } from '../../../src/lib/airtableFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';

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

  const fields = { ...buildMirrorPatch(command, payload) };
  if (goalEcho != null && String(goalEcho).trim()) {
    fields[SF.programmed_goal] = String(goalEcho).trim();
  }

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${studentId}`;

  try {
    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: airtableHeaders(apiKey, { write: true }),
      body: JSON.stringify({ fields, typecast: true }),
    });
    const text = await patchRes.text();
    if (!patchRes.ok) throw new Error(text.slice(0, 400));
    res.status(200).json({ ok: true, command, payload });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'MIRROR_FAILED' });
  }
}
