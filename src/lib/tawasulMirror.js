/**
 * Ghost Mirror — Airtable-backed live commands (specialist → child).
 * Tawasul Students: `mirror command`, `mirror payload` (spaces) · sovereign: snake_case.
 */

import {
  normalizeMirrorCommand,
  readTawasulMirrorCommand,
  readTawasulMirrorPayload,
} from './tawasulStudentFields.js';

export const MIRROR_COMMANDS = {
  ECHO_GOAL: 'echo_goal',
  DROP_STAR: 'drop_star',
  DROP_REWARD: 'drop_reward',
  CALM_PULSE: 'calm_pulse',
  CLEAR: 'clear',
};

const MIRROR_FIELDS = {
  command: 'mirror_command',
  payload: 'mirror_payload',
};

export function parseMirrorState(fields = {}) {
  const cmd = readTawasulMirrorCommand(fields) || normalizeMirrorCommand(
    fields[MIRROR_FIELDS.command] ?? fields.mirror_command ?? fields['mirror command'] ?? ''
  );
  const payload = readTawasulMirrorPayload(fields) || String(
    fields[MIRROR_FIELDS.payload] ?? fields.mirror_payload ?? fields['mirror payload'] ?? ''
  ).trim();
  return { command: cmd, payload, ts: Date.now() };
}

export function buildMirrorPatch(command, payload = '') {
  return {
    [MIRROR_FIELDS.command]: command,
    [MIRROR_FIELDS.payload]: payload,
  };
}

/** Child-side: react once per unique command+payload pair. */
export function mirrorFingerprint(state) {
  return `${state.command}::${state.payload}`;
}
