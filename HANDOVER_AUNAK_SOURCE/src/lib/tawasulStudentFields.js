/**
 * Tawasul sandbox Students table — snake_case protocol (aligned with airtableFields.js).
 * Base app3vCT2j2JepNVZa · table tbliBfCKXNyVtWJiO
 */

import { STUDENT as SF } from './airtableFields.js';

export const TAWASUL_STUDENTS_TABLE_ID = 'tbliBfCKXNyVtWJiO';

/** Canonical column names — single source: airtableFields STUDENT + mirror fields. */
export const TAWASUL_STUDENT = {
  name: 'Name',
  childInteractiveToken: SF.child_interactive_token,
  programmedGoal: SF.programmed_goal,
  mirrorCommand: SF.mirror_command,
  mirrorPayload: SF.mirror_payload,
  initialAssessmentScore: SF.initial_assessment_score,
  comprehensiveAssessmentStatus: SF.comprehensive_assessment_status,
  assignedSpecialist: SF.assigned_specialist,
};

export { SF as TAWASUL_STUDENT_FIELDS };

/** Normalize mirror select values to snake_case (echo_goal, calm_pulse, …). */
export function normalizeMirrorCommand(raw) {
  return String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_');
}

export function mirrorCommandToAirtable(command) {
  return normalizeMirrorCommand(command);
}

export function pickTawasulField(fields, ...keys) {
  if (!fields || typeof fields !== 'object') return null;
  for (const key of keys) {
    const v = fields[key];
    if (v != null && String(v).trim() !== '') return v;
  }
  return null;
}

export function readTawasulProgrammedGoal(fields) {
  return pickTawasulField(fields, SF.programmed_goal);
}

export function readTawasulMirrorCommand(fields) {
  const raw = pickTawasulField(fields, SF.mirror_command);
  return raw ? normalizeMirrorCommand(raw) : '';
}

export function readTawasulMirrorPayload(fields) {
  return pickTawasulField(fields, SF.mirror_payload) ?? '';
}

export function readTawasulAssessmentScore(fields) {
  return pickTawasulField(fields, SF.initial_assessment_score);
}

export function readTawasulComprehensiveStatus(fields) {
  return pickTawasulField(
    fields,
    SF.comprehensive_assessment_status,
    'comprehensive_assessment'
  );
}

/** Pass snake_case patch through; normalize mirror_command values only. */
export function patchToTawasulAirtableFields(patch = {}) {
  const out = { ...patch };
  if (out.mirror_command != null) {
    out[SF.mirror_command] = mirrorCommandToAirtable(out.mirror_command);
  }
  return out;
}

export function buildTawasulMirrorPatch(command, payload = '', goalEcho) {
  const fields = {
    [SF.mirror_command]: mirrorCommandToAirtable(command),
    [SF.mirror_payload]: String(payload ?? ''),
  };
  if (goalEcho != null && String(goalEcho).trim()) {
    fields[SF.programmed_goal] = String(goalEcho).trim();
  }
  return fields;
}
