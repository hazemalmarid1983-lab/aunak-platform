/**
 * Live readiness probe — verify real Airtable path (no MOCK_DATA_MODE).
 *
 *   node scripts/live-readiness.mjs
 *
 * Checks .env.local, pings central base, reports row counts + missing Students fields.
 */
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASE_ID = 'appcjitgWsbvIebwf';

const TABLES = {
  centers: 'tblm1ayaXTG0vdm7d',
  students: 'tblTidBPaVM4cf3O9',
  specialists: 'tblqTYEHCPBO23DBa',
  accessControl: 'tblsGNIKRfTpMZ8Kn',
  dailySessions: 'tblnNGiaKccMSpizT',
  attendanceLedger: 'tbl1oGzt0E5jYNA5e',
};

const REQUIRED_STUDENT_FIELDS = [
  'student_name',
  'national_id',
  'initial_assessment_score',
  'comprehensive_assessment_status',
  'assessment_protocol_json',
  'clinical_questionnaire_json',
  'parent_access_token',
  'specialist_tutor_token',
  'child_interactive_token',
];

function loadEnvLocal() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) return { path, vars: {} };
  const text = readFileSync(path, 'utf8');
  const vars = {};
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    vars[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return { path, vars };
}

function loadPat(vars) {
  return vars.AIRTABLE_API_KEY || vars.VITE_AIRTABLE_PAT || vars.VITE_AIRTABLE_API_KEY || '';
}

async function api(pat, path, options = {}) {
  const res = await fetch(`https://api.airtable.com/v0/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function countRows(pat, tableId) {
  const { ok, status, data } = await api(
    pat,
    `${BASE_ID}/${tableId}?pageSize=1&returnFieldsByFieldId=false`
  );
  if (!ok) return { ok: false, status, error: data?.error?.message || JSON.stringify(data) };
  // Airtable doesn't return total count — fetch first page only for connectivity
  const page = await api(pat, `${BASE_ID}/${tableId}?pageSize=100`);
  if (!page.ok) return { ok: false, status: page.status, error: page.data?.error?.message };
  let n = (page.data.records ?? []).length;
  if (page.data.offset) n = `${n}+ (paginated)`;
  return { ok: true, count: n };
}

async function fetchStudentFieldNames(pat) {
  const { ok, data } = await api(pat, `meta/bases/${BASE_ID}/tables`);
  if (!ok) return { ok: false, fields: [] };
  const students = (data.tables ?? []).find((t) => t.id === TABLES.students);
  return { ok: true, fields: (students?.fields ?? []).map((f) => f.name) };
}

function readMockModeFlag() {
  const src = readFileSync(resolve(ROOT, 'src/lib/airtable.js'), 'utf8');
  const m = src.match(/export const MOCK_DATA_MODE = (true|false)/);
  return m ? m[1] === 'true' : null;
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log(' Aunak — Live Readiness Probe');
  console.log('═══════════════════════════════════════════════════\n');

  const mockMode = readMockModeFlag();
  console.log(` MOCK_DATA_MODE (source): ${mockMode === null ? 'unknown' : mockMode ? '⚠️  true (demo)' : '✅ false (live)'}`);

  const { path: envPath, vars } = loadEnvLocal();
  console.log(` .env.local: ${existsSync(envPath) ? envPath : '❌ missing — copy from .env.example'}`);

  const pat = loadPat(vars);
  const proxy = vars.VITE_USE_AIRTABLE_PROXY === 'true';
  console.log(` VITE_USE_AIRTABLE_PROXY: ${proxy ? 'true (client → /api/airtable)' : 'false'}`);
  console.log(` AIRTABLE_API_KEY / PAT: ${pat ? '✅ set' : '❌ missing'}\n`);

  if (!pat) {
    console.log('Next steps:');
    console.log('  1. Copy .env.example → .env.local');
    console.log('  2. Set AIRTABLE_API_KEY=pat… (scopes: data.records:read/write, schema.bases:read)');
    console.log('  3. npm run schema:students:apply');
    console.log('  4. npm run live:seed');
    console.log('  5. npm run dev — login with access_token from Access Control table');
    process.exit(1);
  }

  if (mockMode) {
    console.log('⚠️  Set MOCK_DATA_MODE = false in src/lib/airtable.js for real end-to-end tests.\n');
  }

  console.log('Connectivity (central base appcjitgWsbvIebwf):');
  let blocked = false;
  for (const [label, tableId] of Object.entries(TABLES)) {
    const r = await countRows(pat, tableId);
    if (!r.ok) {
      console.log(`  ${label}: ❌ ${r.status} — ${r.error}`);
      if (r.status === 429) blocked = true;
    } else {
      console.log(`  ${label}: ✅ ${r.count} row(s)`);
    }
  }

  if (blocked) {
    console.log('\n⚠️  Airtable API quota exceeded (429). Options:');
    console.log('  · Test on production: https://aunak.vercel.app (server proxy uses Vercel env)');
    console.log('  · Upgrade Airtable plan or wait for monthly reset');
    console.log('  · Do NOT use MOCK_DATA_MODE for production validation\n');
  }

  const fieldProbe = await fetchStudentFieldNames(pat);
  if (fieldProbe.ok) {
    const missing = REQUIRED_STUDENT_FIELDS.filter((f) => !fieldProbe.fields.includes(f));
    if (missing.length === 0) {
      console.log('\nStudents schema: ✅ all required assessment fields present');
    } else {
      console.log('\nStudents schema — missing fields:');
      missing.forEach((f) => console.log(`  · ${f}`));
      console.log('\nRun: npm run schema:students:apply');
    }
  }

  console.log('\n── Real test path (after seed) ──');
  console.log('  1. npm run dev');
  console.log('  2. Gate → paste access_token from Access Control (not MOCK-*)');
  console.log('  3. Enrollment → assessment → activation → biometric');
  console.log('  4. Hub → الاستبيان السريري / بروتوكول التقييم / الحضور');
  console.log('  5. Parent: /parent?token=<parent_access_token from Students row>');
  console.log('  6. Ministry UDI: /udi/CHD-XXXX');
  console.log('');
}

main().catch((e) => {
  console.error('FAILED:', e.message || e);
  process.exit(1);
});
