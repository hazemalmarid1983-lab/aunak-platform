/**
 * Extend Tawasul Students table with sovereignty fields (mirror + assessment).
 * Requires PAT with schema.bases:write on base app3vCT2j2JepNVZa.
 *
 * Usage: node scripts/tawasul-extend-schema.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnv() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) {
    console.error('Missing .env.local');
    process.exit(1);
  }
  const text = readFileSync(path, 'utf8');
  const get = (key) => text.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();
  return {
    pat: get('VITE_AIRTABLE_PAT') || get('AIRTABLE_API_KEY'),
    baseId: get('VITE_AIRTABLE_BASE_ID') || get('AIRTABLE_BASE_ID') || 'app3vCT2j2JepNVZa',
    students: get('VITE_AIRTABLE_STUDENTS_TABLE_ID') || 'tbliBfCKXNyVtWJiO',
  };
}

const env = loadEnv();
if (!env.pat) {
  console.error('Missing VITE_AIRTABLE_PAT');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${env.pat}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function api(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${res.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : {};
}

async function ensureField(tableId, fieldDef) {
  const schema = await api(`https://api.airtable.com/v0/meta/bases/${env.baseId}/tables/${tableId}`);
  const exists = (schema.fields ?? []).some((f) => f.name === fieldDef.name);
  if (exists) {
    console.log(`  ✓ ${fieldDef.name} (exists)`);
    return;
  }
  await api(`https://api.airtable.com/v0/meta/bases/${env.baseId}/tables/${tableId}/fields`, {
    method: 'POST',
    body: JSON.stringify(fieldDef),
  });
  console.log(`  + ${fieldDef.name} (created)`);
}

console.log('Extending Students table', env.students, 'in base', env.baseId);

const fields = [
  { name: 'mirror_command', type: 'singleLineText' },
  { name: 'mirror_payload', type: 'singleLineText' },
  { name: 'programmed_goal', type: 'multilineText' },
  { name: 'initial_assessment_score', type: 'number', options: { precision: 0 } },
  {
    name: 'comprehensive_assessment_status',
    type: 'singleSelect',
    options: {
      choices: [{ name: 'not_started' }, { name: 'in_progress' }, { name: 'completed' }],
    },
  },
  { name: 'parent_access_token', type: 'singleLineText' },
  { name: 'child_interactive_token', type: 'singleLineText' },
  { name: 'specialist_tutor_token', type: 'singleLineText' },
];

for (const field of fields) {
  await ensureField(env.students, field);
}

console.log('\nDone. Mirror + assessment + triple tokens ready on Students.');
