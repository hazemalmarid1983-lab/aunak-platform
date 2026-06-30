/**
 * Create Tawasul MVP Airtable base with schema-matched fields.
 * Requires PAT with schema.bases:write + data.records:write.
 *
 * Usage:
 *   set VITE_AIRTABLE_PAT=pat...
 *   set AIRTABLE_WORKSPACE_ID=wsp...   (from Airtable URL when creating base)
 *   node scripts/tawasul-setup-base.mjs
 *
 * Outputs base/table IDs for Vercel Preview env on branch Tawasul_MVP.
 */

import { readFileSync, existsSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadPat() {
  const envPath = resolve(ROOT, '.env.local');
  if (existsSync(envPath)) {
    const text = readFileSync(envPath, 'utf8');
    const m = text.match(/^VITE_AIRTABLE_PAT=(.+)$/m) || text.match(/^AIRTABLE_API_KEY=(.+)$/m);
    if (m?.[1]?.trim()) return m[1].trim();
  }
  return process.env.VITE_AIRTABLE_PAT || process.env.AIRTABLE_API_KEY || '';
}

const pat = loadPat();
const workspaceId = process.env.AIRTABLE_WORKSPACE_ID || '';

if (!pat) {
  console.error('Missing PAT — set VITE_AIRTABLE_PAT in .env.local or env');
  process.exit(1);
}
if (!workspaceId) {
  console.error('Missing AIRTABLE_WORKSPACE_ID — open airtable.com/workspaces and copy wsp... from URL');
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
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : {};
}

const payload = {
  name: 'Tawasul MVP — منصة تواصل',
  workspaceId,
  tables: [
    {
      name: 'Specialists',
      description: 'tblSpecialists — 2 specialists max for MVP',
      fields: [
        { name: 'specialist_name', type: 'singleLineText' },
        {
          name: 'specialist_tutor_token',
          type: 'singleLineText',
          description: 'AUN-SPC-{32hex} — specialist login',
        },
        { name: 'professional_email', type: 'email' },
        {
          name: 'status',
          type: 'singleSelect',
          options: { choices: [{ name: 'active' }, { name: 'inactive' }] },
        },
      ],
    },
    {
      name: 'Students',
      description: 'tblStudents — max 10 (5 per specialist)',
      fields: [
        { name: 'student_name', type: 'singleLineText' },
        { name: 'student_id', type: 'singleLineText' },
        { name: 'age', type: 'number', options: { precision: 0 } },
        {
          name: 'status',
          type: 'singleSelect',
          options: { choices: [{ name: 'new' }, { name: 'active' }] },
        },
        { name: 'child_interactive_token', type: 'singleLineText' },
        { name: 'specialist_tutor_token', type: 'singleLineText' },
        { name: 'programmed_goal', type: 'multilineText' },
        { name: 'initial_assessment_score', type: 'number', options: { precision: 0 } },
        {
          name: 'comprehensive_assessment_status',
          type: 'singleSelect',
          options: {
            choices: [{ name: 'not_started' }, { name: 'in_progress' }, { name: 'completed' }],
          },
        },
      ],
    },
    {
      name: 'Daily Sessions',
      description: 'tblDailySessions — auto-sealed island claims',
      fields: [
        { name: 'session_date', type: 'date', options: { dateFormat: { name: 'iso' } } },
        { name: 'specialist_name', type: 'singleLineText' },
        { name: 'student_name', type: 'singleLineText' },
        { name: 'notes', type: 'multilineText' },
        {
          name: 'claim_status',
          type: 'singleSelect',
          options: { choices: [{ name: 'Sealed' }] },
        },
        { name: 'sealed_at', type: 'dateTime', options: { timeZone: 'client', dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' } } },
        { name: 'session_fee', type: 'number', options: { precision: 2 } },
        { name: 'immutable_hash', type: 'singleLineText' },
      ],
    },
  ],
};

console.log('Creating Tawasul MVP base in workspace', workspaceId);

const base = await api('https://api.airtable.com/v0/meta/bases', {
  method: 'POST',
  body: JSON.stringify(payload),
});

const tables = base.tables ?? [];
const byName = (n) => tables.find((t) => t.name === n);
const specialists = byName('Specialists');
const students = byName('Students');
const sessions = byName('Daily Sessions');

if (!specialists || !students || !sessions) {
  throw new Error('Base created but table lookup failed — check Airtable UI');
}

// Link assigned_specialist on Students → Specialists (must exist after both tables)
await api(`https://api.airtable.com/v0/meta/bases/${base.id}/tables/${students.id}/fields`, {
  method: 'POST',
  body: JSON.stringify({
    name: 'assigned_specialist',
    type: 'multipleRecordLinks',
    options: { linkedTableId: specialists.id },
  }),
});

const envBlock = `# Tawasul MVP — generated ${new Date().toISOString()}
VITE_TAWASUL_MVP=true
VITE_AIRTABLE_BASE_ID=${base.id}
AIRTABLE_BASE_ID=${base.id}
VITE_AIRTABLE_SPECIALISTS_TABLE_ID=${specialists.id}
VITE_AIRTABLE_STUDENTS_TABLE_ID=${students.id}
VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID=${sessions.id}
AIRTABLE_DAILY_SESSIONS_TABLE_ID=${sessions.id}
# VITE_AIRTABLE_PAT=pat...
# AIRTABLE_API_KEY=pat...
`;

const outPath = resolve(ROOT, 'docs/TAWASUL_MVP_ENV.generated.txt');
writeFileSync(outPath, envBlock, 'utf8');

console.log('\n✅ Base created:', base.id);
console.log('   Specialists:', specialists.id);
console.log('   Students:', students.id, '(+ assigned_specialist link)');
console.log('   Daily Sessions:', sessions.id);
console.log('\nEnv block written to:', outPath);
console.log('\nNext:');
console.log('  1. Paste env block into Vercel Preview (branch Tawasul_MVP)');
console.log('  2. node scripts/tawasul-seed.mjs');
