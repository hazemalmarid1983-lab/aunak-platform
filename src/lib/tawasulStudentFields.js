/**
 * Tawasul sandbox Students table — literal Airtable column names (case + spaces).
 * Base app3vCT2j2JepNVZa · table tbliBfCKXNyVtWJiO
 *
 * Sovereign production uses snake_case in airtableFields.js; Tawasul MVP uses spaced names.
 */

export const TAWASUL_STUDENTS_TABLE_ID = 'tbliBfCKXNyVtWJiO';

/** Exact field names as shown in Airtable UI (case-sensitive). */
export const TAWASUL_STUDENT = {
  name: 'Name',
  childInteractiveToken: 'child_interactive_token',
  programmedGoal: 'programmed goal',
  mirrorCommand: 'mirror command',
  mirrorPayload: 'mirror payload',
  initialAssessmentScore: 'Initial assessment score',
  comprehensiveAssessmentStatus: 'comprehensive assessment status',
  assignedSpecialist: 'assigned specialist',
};

/** Canonical mirror command (code) → Airtable select value (spaces). */
export const MIRROR_COMMAND_TO_AIRTABLE = {
  echo_goal: 'echo goal',
  drop_star: 'drop star',
  drop_reward: 'drop reward',
  calm_pulse: 'calm pulse',
  clear: 'clear',
};

/** Airtable select / legacy → canonical mirror command. */
export function normalizeMirrorCommand(raw) {
  const key = String(raw ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
  const map = {
    'echo goal': 'echo_goal',
    echo_goal: 'echo_goal',
    'drop star': 'drop_star',
    drop_star: 'drop_star',
    'drop reward': 'drop_reward',
    drop_reward: 'drop_reward',
    'calm pulse': 'calm_pulse',
    calm_pulse: 'calm_pulse',
    clear: 'clear',
  };
  return map[key] ?? String(raw ?? '').trim().replace(/\s+/g, '_').toLowerCase();
}

export function mirrorCommandToAirtable(command) {
  const canon = normalizeMirrorCommand(command);
  return MIRROR_COMMAND_TO_AIRTABLE[canon] ?? String(command ?? '').trim().replace(/_/g, ' ');
}

/** Read first non-empty value from Airtable row (spaced + snake aliases). */
export function pickTawasulField(fields, ...keys) {
  if (!fields || typeof fields !== 'object') return null;
  for (const key of keys) {
    const v = fields[key];
    if (v != null && String(v).trim() !== '') return v;
  }
  return null;
}

export function readTawasulProgrammedGoal(fields) {
  return pickTawasulField(fields, TAWASUL_STUDENT.programmedGoal, 'programmed_goal', 'Programmed_Goal');
}

export function readTawasulMirrorCommand(fields) {
  const raw = pickTawasulField(
    fields,
    TAWASUL_STUDENT.mirrorCommand,
    'mirror_command',
    'mirror command'
  );
  return raw ? normalizeMirrorCommand(raw) : '';
}

export function readTawasulMirrorPayload(fields) {
  return pickTawasulField(fields, TAWASUL_STUDENT.mirrorPayload, 'mirror_payload', 'mirror payload') ?? '';
}

export function readTawasulAssessmentScore(fields) {
  return pickTawasulField(
    fields,
    TAWASUL_STUDENT.initialAssessmentScore,
    'initial_assessment_score',
    'Initial_Assessment_Score',
    'Initial Assessment Score'
  );
}

export function readTawasulComprehensiveStatus(fields) {
  return pickTawasulField(
    fields,
    TAWASUL_STUDENT.comprehensiveAssessmentStatus,
    'comprehensive_assessment_status',
    'Comprehensive_Assessment_Status',
    'comprehensive assessment status'
  );
}

/** Map API/snake patch keys → literal Airtable Students columns. */
export function patchToTawasulAirtableFields(patch = {}) {
  const alias = {
    programmed_goal: TAWASUL_STUDENT.programmedGoal,
    mirror_command: TAWASUL_STUDENT.mirrorCommand,
    mirror_payload: TAWASUL_STUDENT.mirrorPayload,
    initial_assessment_score: TAWASUL_STUDENT.initialAssessmentScore,
    comprehensive_assessment_status: TAWASUL_STUDENT.comprehensiveAssessmentStatus,
    Name: TAWASUL_STUDENT.name,
    name: TAWASUL_STUDENT.name,
  };

  const out = {};
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined) continue;
    const target = alias[key] ?? key;
    if (target === TAWASUL_STUDENT.mirrorCommand) {
      out[target] = mirrorCommandToAirtable(value);
    } else {
      out[target] = value;
    }
  }
  return out;
}

export function buildTawasulMirrorPatch(command, payload = '', goalEcho) {
  const fields = {
    [TAWASUL_STUDENT.mirrorCommand]: mirrorCommandToAirtable(command),
    [TAWASUL_STUDENT.mirrorPayload]: String(payload ?? ''),
  };
  if (goalEcho != null && String(goalEcho).trim()) {
    fields[TAWASUL_STUDENT.programmedGoal] = String(goalEcho).trim();
  }
  return fields;
}
