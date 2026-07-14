/**
 * Create / extend governance tables for Oman MoSD demo (attendance + goal evidence).
 *
 * Base locked: appaGfKj4vYhMw0cb
 *
 * Usage:
 *   node scripts/extend-governance-schema-production.mjs --dry-run
 *   node scripts/extend-governance-schema-production.mjs --apply
 *
 * On apply: creates missing tables/fields and appends table IDs to .env.local
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const PROD_BASE_ID = 'appaGfKj4vYhMw0cb';
const PROD_STUDENTS_TABLE_ID = 'tblzYmBGmCxx2vdcr';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply') || args.has('--force-apply');

function loadEnv() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) {
    console.error('Missing .env.local');
    process.exit(1);
  }
  return readFileSync(path, 'utf8');
}

function getEnv(text, key) {
  const m = text.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return m?.[1]?.trim().replace(/^["']|["']$/g, '') ?? '';
}

const envText = loadEnv();
const pat =
  getEnv(envText, 'AIRTABLE_API_KEY') ||
  getEnv(envText, 'VITE_AIRTABLE_PAT') ||
  getEnv(envText, 'VITE_AIRTABLE_API_KEY');

if (!pat || pat === 'put_your_token_here') {
  console.error('Missing Airtable PAT');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${pat}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function api(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    const msg = data?.error?.message || data?.error || text.slice(0, 500);
    const err = new Error(`${res.status} ${msg}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function selectChoices(...names) {
  return { choices: names.map((name) => ({ name })) };
}

const ATTENDANCE_TABLE_NAME = 'Attendance Ledger';
const EVIDENCE_TABLE_NAME = 'Goal Evidence';
const CORRECTIONS_TABLE_NAME = 'Attendance Corrections';

const ATTENDANCE_FIELDS = [
  { name: 'ledger_key', type: 'singleLineText', description: 'studentId::YYYY-MM-DD unique' },
  { name: 'student_record_id', type: 'singleLineText' },
  { name: 'student_name', type: 'singleLineText' },
  { name: 'attendance_date', type: 'date', options: { dateFormat: { name: 'iso' } } },
  {
    name: 'status',
    type: 'singleSelect',
    options: selectChoices('present', 'absent', 'excused'),
  },
  { name: 'sealed_at', type: 'singleLineText' },
  { name: 'immutable_hash', type: 'singleLineText' },
  { name: 'recorded_by', type: 'singleLineText' },
  {
    name: 'biometric_verified',
    type: 'checkbox',
    options: { color: 'greenBright', icon: 'check' },
  },
  { name: 'note', type: 'multilineText' },
  { name: 'center_id', type: 'singleLineText' },
];

const EVIDENCE_FIELDS = [
  { name: 'student_record_id', type: 'singleLineText' },
  { name: 'goal_id', type: 'singleLineText' },
  { name: 'goal_label', type: 'singleLineText' },
  { name: 'evidence_date', type: 'date', options: { dateFormat: { name: 'iso' } } },
  { name: 'note', type: 'multilineText' },
  { name: 'success_percent', type: 'number', options: { precision: 0 } },
  {
    name: 'has_photo',
    type: 'checkbox',
    options: { color: 'greenBright', icon: 'check' },
  },
  { name: 'sealed_at', type: 'singleLineText' },
  { name: 'immutable_hash', type: 'singleLineText' },
  { name: 'teacher_id', type: 'singleLineText' },
];

const CORRECTION_FIELDS = [
  { name: 'student_record_id', type: 'singleLineText' },
  { name: 'attendance_date', type: 'date', options: { dateFormat: { name: 'iso' } } },
  {
    name: 'original_status',
    type: 'singleSelect',
    options: selectChoices('present', 'absent', 'excused'),
  },
  {
    name: 'requested_status',
    type: 'singleSelect',
    options: selectChoices('present', 'absent', 'excused'),
  },
  { name: 'reason', type: 'multilineText' },
  { name: 'requested_by', type: 'singleLineText' },
  { name: 'requested_at', type: 'singleLineText' },
  {
    name: 'status',
    type: 'singleSelect',
    options: selectChoices('pending', 'approved', 'rejected'),
  },
  { name: 'original_hash', type: 'singleLineText' },
];

const STUDENT_GOVERNANCE_FIELDS = [
  {
    name: 'active_iep_goals',
    type: 'multilineText',
    description: 'JSON — teacher-selected bank goals for student',
  },
  {
    name: 'iep_support_severity',
    type: 'singleSelect',
    options: selectChoices('mild', 'moderate', 'severe'),
    description: 'Support intensity for goal-bank filtering',
  },
  {
    name: 'custom_goals_pending',
    type: 'multilineText',
    description: 'JSON — custom goals awaiting supervisor approval',
  },
  {
    name: 'assessment_protocol_json',
    type: 'multilineText',
    description: 'JSON — operational assessment protocol session (guide/form/report/seal)',
  },
  {
    name: 'assessment_protocol_status',
    type: 'singleSelect',
    options: selectChoices('not_started', 'in_progress', 'draft_report', 'sealed'),
    description: 'Operational assessment protocol lifecycle',
  },
];

async function listTables() {
  const meta = await api(`https://api.airtable.com/v0/meta/bases/${PROD_BASE_ID}/tables`);
  return meta.tables ?? [];
}

async function createTable(name, fields) {
  return api(`https://api.airtable.com/v0/meta/bases/${PROD_BASE_ID}/tables`, {
    method: 'POST',
    body: JSON.stringify({ name, fields }),
  });
}

async function createField(tableId, fieldDef) {
  return api(`https://api.airtable.com/v0/meta/bases/${PROD_BASE_ID}/tables/${tableId}/fields`, {
    method: 'POST',
    body: JSON.stringify(fieldDef),
  });
}

async function ensureTable(tables, name, fields) {
  const existing = tables.find((t) => t.name === name || t.name.includes(name));
  if (existing) {
    console.log(`✓ Table exists: ${name} (${existing.id})`);
    const have = new Set((existing.fields || []).map((f) => f.name));
    for (const f of fields) {
      if (have.has(f.name)) {
        console.log(`  · field ok: ${f.name}`);
        continue;
      }
      console.log(`  + field: ${f.name}`);
      if (APPLY) {
        try {
          await createField(existing.id, f);
        } catch (e) {
          console.warn(`  ! ${f.name}: ${e.message}`);
        }
      }
    }
    return existing.id;
  }
  console.log(`${APPLY ? '+' : '~'} Create table: ${name}`);
  if (!APPLY) return null;
  const created = await createTable(name, fields);
  console.log(`  created ${created.id}`);
  return created.id;
}

async function ensureStudentFields(tables) {
  const students = tables.find((t) => t.id === PROD_STUDENTS_TABLE_ID);
  if (!students) throw new Error('Students table not found');
  const have = new Set((students.fields || []).map((f) => f.name));
  for (const f of STUDENT_GOVERNANCE_FIELDS) {
    if (have.has(f.name)) {
      console.log(`✓ Students.${f.name}`);
      continue;
    }
    console.log(`${APPLY ? '+' : '~'} Students.${f.name}`);
    if (APPLY) {
      try {
        await createField(PROD_STUDENTS_TABLE_ID, f);
      } catch (e) {
        console.warn(`  ! ${e.message}`);
      }
    }
  }
}

function upsertEnv(key, value) {
  if (!value) return;
  const path = resolve(ROOT, '.env.local');
  let text = readFileSync(path, 'utf8');
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(text)) text = text.replace(re, `${key}=${value}`);
  else text = `${text.trimEnd()}\n${key}=${value}\n`;
  writeFileSync(path, text, 'utf8');
  console.log(`env ← ${key}=${value}`);
}

async function main() {
  console.log(APPLY ? 'APPLY mode' : 'DRY-RUN (pass --apply to write)');
  console.log(`Base ${PROD_BASE_ID}`);
  const tables = await listTables();
  await ensureStudentFields(tables);

  const attendanceId = await ensureTable(tables, ATTENDANCE_TABLE_NAME, ATTENDANCE_FIELDS);
  const evidenceId = await ensureTable(
    await listTables(),
    EVIDENCE_TABLE_NAME,
    EVIDENCE_FIELDS
  );
  const correctionsId = await ensureTable(
    await listTables(),
    CORRECTIONS_TABLE_NAME,
    CORRECTION_FIELDS
  );

  if (APPLY) {
    if (attendanceId) upsertEnv('VITE_AIRTABLE_ATTENDANCE_TABLE_ID', attendanceId);
    if (evidenceId) upsertEnv('VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID', evidenceId);
    if (correctionsId) upsertEnv('VITE_AIRTABLE_ATTENDANCE_CORRECTIONS_TABLE_ID', correctionsId);
  } else {
    console.log('\nNo writes. Re-run with --apply to create tables and update .env.local');
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
