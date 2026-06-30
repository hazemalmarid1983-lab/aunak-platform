/**
 * Ghost Mirror — Airtable-backed live commands (specialist → child).
 * Students: mirror_command, mirror_payload, programmed_goal (snake_case).
 */

import { STUDENT as SF } from './airtableFields.js';
import { normalizeMirrorCommand, readTawasulMirrorCommand, readTawasulMirrorPayload } from './tawasulStudentFields.js';

export const MIRROR_COMMANDS = {
  ECHO_GOAL: 'echo_goal',
  DROP_STAR: 'drop_star',
  DROP_REWARD: 'drop_reward',
  CALM_PULSE: 'calm_pulse',
  CLEAR: 'clear',
};

export function parseMirrorState(fields = {}) {
  const cmd =
    readTawasulMirrorCommand(fields) ||
    normalizeMirrorCommand(fields[SF.mirror_command] ?? fields.mirror_command ?? '');
  const payload =
    readTawasulMirrorPayload(fields) ||
    String(fields[SF.mirror_payload] ?? fields.mirror_payload ?? '').trim();
  return { command: cmd, payload, ts: Date.now() };
}

export function buildMirrorPatch(command, payload = '') {
  return {
    [SF.mirror_command]: normalizeMirrorCommand(command),
    [SF.mirror_payload]: String(payload ?? ''),
  };
}

/** Child-side: react once per unique command+payload pair. */
export function mirrorFingerprint(state) {
  return `${state.command}::${state.payload}`;
}
