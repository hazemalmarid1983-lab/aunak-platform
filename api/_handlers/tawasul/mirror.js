/**
 * POST /api/tawasul/mirror — Ghost Mirror (self-contained server handler).
 */

import { STUDENT as SF } from '../../../src/lib/airtableFields.js';
import { airtableHeaders, tawasulVerifyConfig } from './config.js';
import { formatAirtableApiError } from './airtableError.js';
import {
  sanitizeGoalText,
  sanitizeMirrorCommand,
  sanitizeMirrorPayload,
  sanitizeRecordId,
} from './sanitize.js';

const DEFAULT_PAYLOAD = {
  echo_goal: 'live',
  drop_star: 'star',
  drop_reward: 'reward',
  calm_pulse: '1',
  clear: 'clear',
};

function buildMirrorFields(command, payload, goalEcho) {
  const fields = {
    [SF.mirror_command]: command,
    [SF.mirror_payload]: payload,
  };
  if (command === 'echo_goal' && goalEcho) {
    fields[SF.programmed_goal] = goalEcho;
  }
  return fields;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const studentId = sanitizeRecordId(req.body?.studentId);
  const command = sanitizeMirrorCommand(req.body?.command);
  const payload = sanitizeMirrorPayload(req.body?.payload, DEFAULT_PAYLOAD[command] ?? '1');
  const goalEcho =
    command === 'echo_goal'
      ? sanitizeGoalText(req.body?.goalEcho ?? req.body?.goal ?? req.body?.programmed_goal)
      : '';

  if (!studentId || !command) {
    res.status(400).json({ error: 'STUDENT_ID_AND_COMMAND_REQUIRED' });
    return;
  }

  if (command === 'echo_goal' && !goalEcho) {
    res.status(400).json({ error: 'GOAL_TEXT_REQUIRED' });
    return;
  }

  const { apiKey, baseId, studentsTable } = tawasulVerifyConfig();
  if (!apiKey) {
    res.status(500).json({ error: 'AIRTABLE_NOT_CONFIGURED' });
    return;
  }

  const fields = buildMirrorFields(command, payload, goalEcho);
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
    console.error('[tawasul/mirror]', message);
    const status = /403|422|404/.test(message) ? 422 : 500;
    res.status(status).json({ error: message });
  }
}
