/**
 * Diagnose Airtable 403 / INVALID_PERMISSIONS_OR_MODEL_NOT_FOUND
 * Does not print secrets — only base/table reachability.
 *
 *   node scripts/diagnose-airtable-access.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnv() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) return {};
  const out = {};
  for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    out[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

const env = loadEnv();
const pat =
  env.AIRTABLE_API_KEY || env.VITE_AIRTABLE_PAT || env.VITE_AIRTABLE_API_KEY || '';
const baseId = (env.AIRTABLE_BASE_ID || env.VITE_AIRTABLE_BASE_ID || 'appcjitgWsbvIebwf').split('/')[0];

const tables = {
  Centers: env.VITE_AIRTABLE_CENTERS_TABLE_ID,
  Students: env.VITE_AIRTABLE_STUDENTS_TABLE_ID,
  Specialists: env.VITE_AIRTABLE_SPECIALISTS_TABLE_ID,
  Access: env.VITE_AIRTABLE_ACCESS_TABLE_ID || env.VITE_AIRTABLE_ACCESS_CONTROL_TABLE_ID,
  DailySessions: env.VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID,
  SessionPeriods: env.VITE_AIRTABLE_SESSION_PERIODS_TABLE_ID,
  Attendance: env.VITE_AIRTABLE_ATTENDANCE_TABLE_ID,
  GoalEvidence: env.VITE_AIRTABLE_GOAL_EVIDENCE_TABLE_ID,
  Corrections: env.VITE_AIRTABLE_ATTENDANCE_CORRECTIONS_TABLE_ID,
};

console.log('PAT:', pat ? `SET (${pat.slice(0, 7)}… len=${pat.length})` : 'MISSING');
console.log('BASE:', baseId);
console.log('');

if (!pat) process.exit(1);

const headers = {
  Authorization: `Bearer ${pat}`,
  Accept: 'application/json',
};

async function check(label, url) {
  const res = await fetch(url, { headers });
  const text = await res.text();
  let msg = '';
  try {
    const j = JSON.parse(text);
    msg = j?.error?.type || j?.error?.message || text.slice(0, 120);
  } catch {
    msg = text.slice(0, 120);
  }
  const ok = res.ok ? 'OK' : `FAIL ${res.status}`;
  console.log(`${ok.padEnd(10)} ${label} → ${msg}`);
  return res.ok;
}

const metaOk = await check(
  'meta/tables',
  `https://api.airtable.com/v0/meta/bases/${baseId}/tables`
);

if (!metaOk) {
  console.log('\n→ PAT cannot see this base. In Airtable: Personal access tokens → edit token → add base appcjitgWsbvIebwf (or grant workspace).');
  process.exit(2);
}

for (const [name, id] of Object.entries(tables)) {
  if (!id) {
    console.log(`SKIP       ${name} (env missing)`);
    continue;
  }
  await check(`${name} (${id})`, `https://api.airtable.com/v0/${baseId}/${id}?maxRecords=1`);
}

console.log('\nAlso check legacy base access (should still work for archive):');
await check(
  'legacy meta',
  'https://api.airtable.com/v0/meta/bases/appaGfKj4vYhMw0cb/tables'
);
