/**
 * Inject English Talk Island fields into the existing Students table.
 * Requires a PAT with schema.bases:write on the target base.
 *
 * Adds (idempotently):
 *   - student_english_token    (singleLineText)  AUN-ENG-{32hex}
 *   - last_spoken_text         (multilineText)   latest spoken phrase
 *   - pronunciation_accuracy   (number, 0 dp)    0–100 live accuracy
 *
 * initial_assessment_score + comprehensive_assessment_status already exist
 * (created by scripts/tawasul-setup-base.mjs) so they are skipped.
 *
 * Usage (PowerShell):
 *   $env:VITE_AIRTABLE_PAT="pat..."
 *   $env:AIRTABLE_BASE_ID="app3vCT2j2JepNVZa"          # Tawasul sandbox base
 *   $env:AIRTABLE_STUDENTS_TABLE_ID="tbliBfCKXNyVtWJiO" # Tawasul Students table
 *   node scripts/english-island-fields.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function fromEnvFile(name) {
  const envPath = resolve(ROOT, '.env.local');
  if (!existsSync(envPath)) return '';
  const text = readFileSync(envPath, 'utf8');
  const m = text.match(new RegExp(`^${name}=(.+)$`, 'm'));
  return m?.[1]?.trim() ?? '';
}

const pat =
  process.env.VITE_AIRTABLE_PAT ||
  process.env.AIRTABLE_API_KEY ||
  fromEnvFile('VITE_AIRTABLE_PAT') ||
  fromEnvFile('AIRTABLE_API_KEY');

const baseId =
  process.env.AIRTABLE_BASE_ID ||
  process.env.VITE_AIRTABLE_BASE_ID ||
  fromEnvFile('VITE_AIRTABLE_BASE_ID') ||
  'app3vCT2j2JepNVZa';

const studentsTable =
  process.env.AIRTABLE_STUDENTS_TABLE_ID ||
  process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID ||
  fromEnvFile('VITE_AIRTABLE_STUDENTS_TABLE_ID') ||
  'tbliBfCKXNyVtWJiO';

if (!pat) {
  console.error('Missing PAT — set VITE_AIRTABLE_PAT (needs schema.bases:write).');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${pat}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

const FIELDS = [
  {
    name: 'student_english_token',
    type: 'singleLineText',
    description: 'AUN-ENG-{32hex} — English Talk Island direct-entry token',
  },
  {
    name: 'last_spoken_text',
    type: 'multilineText',
    description: 'Latest phrase spoken aloud by the student (captured live)',
  },
  {
    name: 'pronunciation_accuracy',
    type: 'number',
    options: { precision: 0 },
    description: 'Pronunciation accuracy 0–100, refreshed each attempt',
  },
];

const url = `https://api.airtable.com/v0/meta/bases/${baseId}/tables/${studentsTable}/fields`;

console.log(`Injecting English Island fields into ${baseId}/${studentsTable}\n`);

for (const field of FIELDS) {
  try {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(field) });
    const text = await res.text();
    if (res.ok) {
      console.log(`  ✅ created  ${field.name}`);
    } else if (/DUPLICATE|already exists|same name/i.test(text)) {
      console.log(`  = exists   ${field.name} (skipped)`);
    } else {
      console.log(`  ⚠️  ${field.name}: ${res.status} ${text.slice(0, 200)}`);
    }
  } catch (err) {
    console.log(`  ⚠️  ${field.name}: ${err?.message}`);
  }
}

console.log('\nDone. Verify the three columns in the Airtable Students table.');
