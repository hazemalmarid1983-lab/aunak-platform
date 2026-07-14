/**
 * Bootstrap Aunak central multi-center Airtable base (MoSD / SPED).
 *
 * Base: appcjitgWsbvIebwf
 *
 * Tables (professional naming only):
 *   Centers · Specialists · Students · Access Control
 *   Daily Sessions · Session Periods
 *   Attendance Ledger · Goal Evidence · Attendance Corrections
 *
 * Usage:
 *   node scripts/bootstrap-central-base.mjs --dry-run
 *   node scripts/bootstrap-central-base.mjs --apply
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASE_ID = process.env.AUNAK_CENTRAL_BASE_ID || 'appcjitgWsbvIebwf';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply') || args.has('--force-apply');

function loadEnv() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) {
    console.error('Missing .env.local (need Airtable PAT)');
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
  console.error('Missing Airtable PAT in .env.local');
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
    const msg = data?.error?.message || data?.error || text.slice(0, 600);
    const err = new Error(`${res.status} ${typeof msg === 'string' ? msg : JSON.stringify(msg)}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

const select = (...names) => ({ choices: names.map((name) => ({ name })) });
const dateIso = { dateFormat: { name: 'iso' } };
const dateTimeIso = {
  timeZone: 'Asia/Muscat',
  dateFormat: { name: 'iso' },
  timeFormat: { name: '24hour' },
};
const check = { color: 'greenBright', icon: 'check' };
const num0 = { precision: 0 };
const num2 = { precision: 2 };

/** Professional specialties — not commercial labels */
const SPECIALTY = select(
  'special_education',
  'speech_language',
  'occupational_therapy',
  'physiotherapy',
  'psychology',
  'social_work',
  'early_intervention'
);

const DUTY_SHIFT = select('morning', 'evening', 'day');

const TABLES = [
  {
    name: 'Centers',
    envKey: 'VITE_AIRTABLE_CENTERS_TABLE_ID',
    fields: [
      { name: 'center_name', type: 'singleLineText', description: 'Official center name (EN/transliteration)' },
      { name: 'center_name_ar', type: 'singleLineText', description: 'الاسم الرسمي للمركز' },
      { name: 'center_code', type: 'singleLineText', description: 'Unique short code e.g. MOSD-MSK-01' },
      {
        name: 'center_type',
        type: 'singleSelect',
        options: select('private', 'government'),
        description: 'private = dual shifts; government = single day shift',
      },
      {
        name: 'shift_model',
        type: 'singleSelect',
        options: select('dual', 'single'),
        description: 'dual=morning+evening (private); single=day (government)',
      },
      { name: 'morning_start', type: 'singleLineText', description: 'HH:mm e.g. 07:30' },
      { name: 'morning_end', type: 'singleLineText', description: 'HH:mm e.g. 12:30' },
      { name: 'evening_start', type: 'singleLineText', description: 'Private only — HH:mm' },
      { name: 'evening_end', type: 'singleLineText', description: 'Private only — HH:mm' },
      { name: 'day_start', type: 'singleLineText', description: 'Government single shift start HH:mm' },
      { name: 'day_end', type: 'singleLineText', description: 'Government single shift end HH:mm' },
      { name: 'governorate', type: 'singleLineText' },
      { name: 'wilayat', type: 'singleLineText' },
      { name: 'ministry_license_no', type: 'singleLineText' },
      { name: 'contact_phone', type: 'phoneNumber' },
      { name: 'contact_email', type: 'email' },
      { name: 'address', type: 'multilineText' },
      {
        name: 'status',
        type: 'singleSelect',
        options: select('active', 'inactive', 'suspended'),
      },
      { name: 'notes', type: 'multilineText' },
    ],
  },
  {
    name: 'Specialists',
    envKey: 'VITE_AIRTABLE_SPECIALISTS_TABLE_ID',
    fields: [
      { name: 'specialist_name', type: 'singleLineText' },
      { name: 'specialist_name_ar', type: 'singleLineText' },
      { name: 'specialty', type: 'singleSelect', options: SPECIALTY },
      { name: 'professional_email', type: 'email' },
      { name: 'contact_phone', type: 'phoneNumber' },
      { name: 'center_code', type: 'singleLineText', description: 'FK → Centers.center_code' },
      { name: 'center_record_id', type: 'singleLineText', description: 'Airtable record id of center' },
      {
        name: 'duty_shifts',
        type: 'multipleSelects',
        options: DUTY_SHIFT,
        description: 'Which shifts this professional covers',
      },
      {
        name: 'status',
        type: 'singleSelect',
        options: select('active', 'inactive', 'on_leave'),
      },
      { name: 'active_cases', type: 'number', options: num0 },
      { name: 'license_no', type: 'singleLineText' },
      { name: 'admin_notes', type: 'multilineText' },
      { name: 'specialist_tutor_token', type: 'singleLineText' },
    ],
  },
  {
    name: 'Students',
    envKey: 'VITE_AIRTABLE_STUDENTS_TABLE_ID',
    fields: [
      { name: 'student_name', type: 'singleLineText' },
      { name: 'student_name_ar', type: 'singleLineText' },
      { name: 'student_id', type: 'singleLineText' },
      { name: 'national_id', type: 'singleLineText', description: 'Civil ID — enrollment upsert key' },
      { name: 'age', type: 'number', options: num0 },
      { name: 'date_of_birth', type: 'date', options: dateIso },
      { name: 'gender', type: 'singleSelect', options: select('male', 'female') },
      { name: 'center_code', type: 'singleLineText' },
      { name: 'center_record_id', type: 'singleLineText' },
      {
        name: 'assigned_shift',
        type: 'singleSelect',
        options: DUTY_SHIFT,
        description: 'morning|evening for private; day for government',
      },
      { name: 'assigned_class', type: 'singleLineText' },
      { name: 'assigned_specialist_id', type: 'singleLineText' },
      { name: 'diagnosis', type: 'multilineText', description: 'Clinician-only' },
      { name: 'presenting_symptoms', type: 'multilineText' },
      { name: 'screening_weights', type: 'multilineText' },
      { name: 'parent_phone', type: 'phoneNumber' },
      { name: 'parent_country_code', type: 'singleLineText' },
      { name: 'parent_name', type: 'singleLineText' },
      {
        name: 'status',
        type: 'singleSelect',
        options: select('new', 'active', 'inactive', 'graduated'),
      },
      {
        name: 'subscription_status',
        type: 'singleSelect',
        options: select('pending', 'active', 'expired'),
      },
      {
        name: 'plan_code',
        type: 'singleSelect',
        options: select('free', 'tutor', 'medical', 'institution', 'assessment_only'),
      },
      { name: 'activation_code_used', type: 'singleLineText' },
      { name: 'last_payment_at', type: 'dateTime', options: dateTimeIso },
      { name: 'payment_method', type: 'singleLineText' },
      { name: 'subscription_expires_at', type: 'date', options: dateIso },
      {
        name: 'payment_status',
        type: 'singleSelect',
        options: select('unpaid', 'paid', 'waived'),
      },
      { name: 'face_biometric', type: 'multilineText' },
      {
        name: 'biometric_status',
        type: 'singleSelect',
        options: select('pending', 'approved', 'rejected'),
      },
      {
        name: 'biometric_attendance_verified',
        type: 'checkbox',
        options: check,
      },
      { name: 'biometric_attendance_at', type: 'dateTime', options: dateTimeIso },
      { name: 'initial_assessment_score', type: 'number', options: num0 },
      {
        name: 'comprehensive_assessment_status',
        type: 'singleSelect',
        options: select('not_started', 'in_progress', 'completed'),
      },
      { name: 'assessment_protocol_json', type: 'multilineText' },
      {
        name: 'assessment_protocol_status',
        type: 'singleSelect',
        options: select('not_started', 'in_progress', 'draft_report', 'sealed'),
      },
      { name: 'active_iep_goals', type: 'multilineText' },
      {
        name: 'iep_support_severity',
        type: 'singleSelect',
        options: select('mild', 'moderate', 'severe'),
      },
      { name: 'custom_goals_pending', type: 'multilineText' },
      { name: 'programmed_goal', type: 'multilineText' },
      { name: 'parent_access_token', type: 'singleLineText' },
      { name: 'child_interactive_token', type: 'singleLineText' },
      { name: 'specialist_tutor_token', type: 'singleLineText' },
      {
        name: 'preferred_destination',
        type: 'singleSelect',
        options: select('live', 'registry', 'governance', 'assessmentProtocol'),
      },
      { name: 'clinical_session_notes', type: 'multilineText' },
      { name: 'ai_session_report', type: 'multilineText' },
      { name: 'zero_point_report', type: 'multilineText' },
      { name: 'academic_progress', type: 'number', options: num0 },
      { name: 'behavior_intensity', type: 'number', options: num0 },
      { name: 'focus_level', type: 'number', options: num0 },
      { name: 't_static', type: 'number', options: num0 },
      { name: 'improvement_index', type: 'number', options: num2 },
      { name: 'operating_efficiency', type: 'number', options: num2 },
      { name: 'harmony_score', type: 'number', options: num0 },
      { name: 'session_fee', type: 'number', options: num2 },
      { name: 'enrollment_date', type: 'date', options: dateIso },
      { name: 'notes', type: 'multilineText' },
    ],
  },
  {
    name: 'Access Control',
    envKey: 'VITE_AIRTABLE_ACCESS_TABLE_ID',
    fields: [
      { name: 'user_name', type: 'singleLineText' },
      { name: 'user_email', type: 'email' },
      {
        name: 'status',
        type: 'singleSelect',
        options: select('active', 'inactive'),
      },
      { name: 'permissions', type: 'singleLineText' },
      {
        name: 'access_level',
        type: 'singleSelect',
        options: select('parent', 'admin', 'specialist', 'center_manager', 'ministry_auditor'),
      },
      { name: 'access_areas', type: 'multilineText' },
      { name: 'access_token', type: 'singleLineText' },
      { name: 'center_code', type: 'singleLineText' },
      { name: 'center_record_id', type: 'singleLineText' },
      { name: 'last_login', type: 'dateTime', options: dateTimeIso },
    ],
  },
  {
    name: 'Daily Sessions',
    envKey: 'VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID',
    fields: [
      { name: 'session_date', type: 'date', options: dateIso },
      { name: 'center_code', type: 'singleLineText' },
      { name: 'duty_shift', type: 'singleSelect', options: DUTY_SHIFT },
      { name: 'specialty', type: 'singleSelect', options: SPECIALTY },
      { name: 'specialist_name', type: 'singleLineText' },
      { name: 'specialist_record_id', type: 'singleLineText' },
      { name: 'student_name', type: 'singleLineText' },
      { name: 'student_record_id', type: 'singleLineText' },
      { name: 'notes', type: 'multilineText' },
      {
        name: 'claim_status',
        type: 'singleSelect',
        options: select('draft', 'sealed'),
      },
      { name: 'sealed_at', type: 'dateTime', options: dateTimeIso },
      { name: 'specialist_signature', type: 'multilineText' },
      { name: 'immutable_hash', type: 'singleLineText' },
      { name: 'session_sequence', type: 'number', options: num0 },
      {
        name: 'pin_verified',
        type: 'checkbox',
        options: check,
      },
      { name: 'session_fee', type: 'number', options: num2 },
    ],
  },
  {
    name: 'Session Periods',
    envKey: 'VITE_AIRTABLE_SESSION_PERIODS_TABLE_ID',
    description: 'Daily period timetable per center / shift / specialty',
    fields: [
      { name: 'period_key', type: 'singleLineText', description: 'center::date::shift::period_no unique' },
      { name: 'center_code', type: 'singleLineText' },
      { name: 'center_record_id', type: 'singleLineText' },
      { name: 'session_date', type: 'date', options: dateIso },
      {
        name: 'duty_shift',
        type: 'singleSelect',
        options: DUTY_SHIFT,
        description: 'morning|evening private; day government',
      },
      { name: 'period_number', type: 'number', options: num0 },
      { name: 'start_time', type: 'singleLineText', description: 'HH:mm' },
      { name: 'end_time', type: 'singleLineText', description: 'HH:mm' },
      { name: 'specialty', type: 'singleSelect', options: SPECIALTY },
      { name: 'specialist_name', type: 'singleLineText' },
      { name: 'specialist_record_id', type: 'singleLineText' },
      { name: 'student_name', type: 'singleLineText' },
      { name: 'student_record_id', type: 'singleLineText' },
      { name: 'room_or_hall', type: 'singleLineText' },
      {
        name: 'period_status',
        type: 'singleSelect',
        options: select('scheduled', 'in_progress', 'completed', 'cancelled', 'absent_student'),
      },
      {
        name: 'goal_focus',
        type: 'multilineText',
        description: 'IEP / therapy objective for this period',
      },
      { name: 'session_notes', type: 'multilineText' },
      { name: 'recorded_by', type: 'singleLineText' },
      { name: 'sealed_at', type: 'singleLineText' },
      { name: 'immutable_hash', type: 'singleLineText' },
    ],
  },
  {
    name: 'Attendance Ledger',
    envKey: 'VITE_AIRTABLE_ATTENDANCE_TABLE_ID',
    fields: [
      { name: 'ledger_key', type: 'singleLineText' },
      { name: 'center_code', type: 'singleLineText' },
      { name: 'center_id', type: 'singleLineText' },
      { name: 'duty_shift', type: 'singleSelect', options: DUTY_SHIFT },
      { name: 'student_record_id', type: 'singleLineText' },
      { name: 'student_name', type: 'singleLineText' },
      { name: 'attendance_date', type: 'date', options: dateIso },
      {
        name: 'status',
        type: 'singleSelect',
        options: select('present', 'absent', 'excused'),
      },
      { name: 'sealed_at', type: 'singleLineText' },
      { name: 'immutable_hash', type: 'singleLineText' },
      { name: 'recorded_by', type: 'singleLineText' },
      { name: 'biometric_verified', type: 'checkbox', options: check },
      { name: 'note', type: 'multilineText' },
    ],
  },
  {
    name: 'Goal Evidence',
    envKey: 'VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID',
    fields: [
      { name: 'center_code', type: 'singleLineText' },
      { name: 'student_record_id', type: 'singleLineText' },
      { name: 'goal_id', type: 'singleLineText' },
      { name: 'goal_label', type: 'singleLineText' },
      { name: 'specialty', type: 'singleSelect', options: SPECIALTY },
      { name: 'evidence_date', type: 'date', options: dateIso },
      { name: 'duty_shift', type: 'singleSelect', options: DUTY_SHIFT },
      { name: 'note', type: 'multilineText' },
      { name: 'success_percent', type: 'number', options: num0 },
      { name: 'has_photo', type: 'checkbox', options: check },
      { name: 'sealed_at', type: 'singleLineText' },
      { name: 'immutable_hash', type: 'singleLineText' },
      { name: 'teacher_id', type: 'singleLineText' },
    ],
  },
  {
    name: 'Attendance Corrections',
    envKey: 'VITE_AIRTABLE_ATTENDANCE_CORRECTIONS_TABLE_ID',
    fields: [
      { name: 'center_code', type: 'singleLineText' },
      { name: 'student_record_id', type: 'singleLineText' },
      { name: 'attendance_date', type: 'date', options: dateIso },
      { name: 'duty_shift', type: 'singleSelect', options: DUTY_SHIFT },
      {
        name: 'original_status',
        type: 'singleSelect',
        options: select('present', 'absent', 'excused'),
      },
      {
        name: 'requested_status',
        type: 'singleSelect',
        options: select('present', 'absent', 'excused'),
      },
      { name: 'reason', type: 'multilineText' },
      { name: 'requested_by', type: 'singleLineText' },
      { name: 'requested_at', type: 'singleLineText' },
      {
        name: 'status',
        type: 'singleSelect',
        options: select('pending', 'approved', 'rejected'),
      },
      { name: 'original_hash', type: 'singleLineText' },
    ],
  },
];

async function listTables() {
  const meta = await api(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`);
  return meta.tables ?? [];
}

async function createTable(name, fields, description) {
  const body = { name, fields };
  if (description) body.description = description;
  return api(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

async function createField(tableId, fieldDef) {
  return api(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${tableId}/fields`, {
    method: 'POST',
    body: JSON.stringify(fieldDef),
  });
}

async function renameTable(tableId, name) {
  return api(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${tableId}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}

function findTable(tables, name) {
  return tables.find((t) => t.name === name || t.name.trim() === name);
}

async function ensureTable(def) {
  let tables = await listTables();
  let existing = findTable(tables, def.name);

  // Reuse blank default "Table 1" as Centers if still empty-ish
  if (!existing && def.name === 'Centers') {
    const blank = tables.find((t) => /^Table \d+$/i.test(t.name) || t.name === 'Untitled');
    if (blank && APPLY) {
      console.log(`~ Rename "${blank.name}" → Centers`);
      await renameTable(blank.id, 'Centers');
      tables = await listTables();
      existing = findTable(tables, 'Centers');
    }
  }

  if (existing) {
    console.log(`✓ ${def.name} (${existing.id})`);
    const have = new Set((existing.fields || []).map((f) => f.name));
    for (const f of def.fields) {
      if (have.has(f.name)) continue;
      console.log(`  + field ${f.name}`);
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

  console.log(`${APPLY ? '+' : '~'} Create ${def.name}`);
  if (!APPLY) return null;
  const created = await createTable(def.name, def.fields, def.description);
  console.log(`  → ${created.id}`);
  return created.id;
}

async function seedDemoCenter(centersTableId) {
  if (!APPLY || !centersTableId) return;
  const url = `https://api.airtable.com/v0/${BASE_ID}/${centersTableId}`;
  const list = await api(`${url}?maxRecords=1`);
  if ((list.records || []).length > 0) {
    console.log('· Centers already has rows — skip seed');
    return;
  }
  console.log('+ Seed demo centers (private dual + government single)');
  await api(url, {
    method: 'POST',
    body: JSON.stringify({
      records: [
        {
          fields: {
            center_name: 'Private Special Education Center — Demo',
            center_name_ar: 'مركز تربية خاصة خاص — تجريبي',
            center_code: 'PRIV-DEMO-01',
            center_type: 'private',
            shift_model: 'dual',
            morning_start: '07:30',
            morning_end: '12:30',
            evening_start: '15:00',
            evening_end: '19:00',
            governorate: 'Muscat',
            status: 'active',
          },
        },
        {
          fields: {
            center_name: 'Government Special Education Center — Demo',
            center_name_ar: 'مركز تربية خاصة حكومي — تجريبي',
            center_code: 'GOV-DEMO-01',
            center_type: 'government',
            shift_model: 'single',
            day_start: '07:30',
            day_end: '13:30',
            governorate: 'Muscat',
            status: 'active',
          },
        },
      ],
    }),
  });
}

function upsertEnv(key, value) {
  if (!value) return;
  const path = resolve(ROOT, '.env.local');
  let text = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(text)) text = text.replace(re, `${key}=${value}`);
  else text = `${text.trimEnd()}\n${key}=${value}\n`;
  writeFileSync(path, text, 'utf8');
}

async function main() {
  console.log(APPLY ? 'APPLY mode' : 'DRY-RUN (pass --apply to write)');
  console.log(`Central base: ${BASE_ID}\n`);

  const ids = {};
  for (const def of TABLES) {
    const id = await ensureTable(def);
    ids[def.envKey] = id;
    ids[def.name] = id;
  }

  await seedDemoCenter(ids.Centers || ids.VITE_AIRTABLE_CENTERS_TABLE_ID);

  const envBlock = `# Aunak Central Base — generated ${new Date().toISOString()}
# Base: ${BASE_ID}
VITE_AIRTABLE_BASE_ID=${BASE_ID}
AIRTABLE_BASE_ID=${BASE_ID}
VITE_AIRTABLE_CENTERS_TABLE_ID=${ids['VITE_AIRTABLE_CENTERS_TABLE_ID'] || ''}
VITE_AIRTABLE_STUDENTS_TABLE_ID=${ids['VITE_AIRTABLE_STUDENTS_TABLE_ID'] || ''}
VITE_AIRTABLE_SPECIALISTS_TABLE_ID=${ids['VITE_AIRTABLE_SPECIALISTS_TABLE_ID'] || ''}
VITE_AIRTABLE_ACCESS_TABLE_ID=${ids['VITE_AIRTABLE_ACCESS_TABLE_ID'] || ''}
VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID=${ids['VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID'] || ''}
VITE_AIRTABLE_SESSION_PERIODS_TABLE_ID=${ids['VITE_AIRTABLE_SESSION_PERIODS_TABLE_ID'] || ''}
VITE_AIRTABLE_ATTENDANCE_TABLE_ID=${ids['VITE_AIRTABLE_ATTENDANCE_TABLE_ID'] || ''}
VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID=${ids['VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID'] || ''}
VITE_AIRTABLE_ATTENDANCE_CORRECTIONS_TABLE_ID=${ids['VITE_AIRTABLE_ATTENDANCE_CORRECTIONS_TABLE_ID'] || ''}
`;

  const outPath = resolve(ROOT, 'docs/CENTRAL_BASE_ENV.generated.txt');
  writeFileSync(outPath, envBlock, 'utf8');
  console.log(`\nWrote ${outPath}`);

  if (APPLY) {
    upsertEnv('VITE_AIRTABLE_BASE_ID', BASE_ID);
    upsertEnv('AIRTABLE_BASE_ID', BASE_ID);
    for (const def of TABLES) {
      if (ids[def.envKey]) upsertEnv(def.envKey, ids[def.envKey]);
    }
    // Keep legacy access key alias used in some scripts
    if (ids.VITE_AIRTABLE_ACCESS_TABLE_ID) {
      upsertEnv('VITE_AIRTABLE_ACCESS_CONTROL_TABLE_ID', ids.VITE_AIRTABLE_ACCESS_TABLE_ID);
    }
    console.log('Updated .env.local with base + table IDs');
  } else {
    console.log('\nNo schema writes. Re-run with --apply');
  }

  console.log('\n=== Summary ===');
  for (const def of TABLES) {
    console.log(`  ${def.name}: ${ids[def.envKey] || '(pending apply)'}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
