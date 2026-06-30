/**
 * POST /api/tawasul/mirror
 * Ghost Mirror — specialist manual override → child screen (Airtable mirror_command).
 */

import { buildMirrorPatch } from '../../src/lib/tawasulMirror.js';
import { airtableConfigFromEnv, sanitizeAscii } from '../../src/lib/paymentActivation.js';
import { STUDENT as SF } from '../../src/lib/airtableFields.js';

function studentsTableId() {
  return (
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) ||
    'tbliBfCKXNyVtWJiO'
  );
}

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

  const { apiKey, baseId } = airtableConfigFromEnv();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  const fields = { ...buildMirrorPatch(command, payload) };
  if (goalEcho != null && String(goalEcho).trim()) {
    fields[SF.programmed_goal] = String(goalEcho).trim();
  }

  const tableId = studentsTableId();
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}/${studentId}`;

  try {
    const patchRes = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields, typecast: true }),
    });
    const text = await patchRes.text();
    if (!patchRes.ok) throw new Error(text.slice(0, 400));
    res.status(200).json({ ok: true, command, payload });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'MIRROR_FAILED' });
  }
}
