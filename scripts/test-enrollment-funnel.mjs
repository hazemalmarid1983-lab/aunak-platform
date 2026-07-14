/**
 * Smoke-test Enrollment Funnel against PRODUCTION Students table.
 * Creates a disposable QA row, verifies identity lock + resume, then deletes it.
 *
 * Usage:
 *   node scripts/test-enrollment-funnel.mjs
 *
 * Locked to: appaGfKj4vYhMw0cb / tblzYmBGmCxx2vdcr
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import {
  resolveFunnelPhase,
  FUNNEL_PHASES,
  buildIdentityLookupFormula,
  normalizeNationalId,
  normalizeEnglishStudentName,
} from '../src/lib/enrollmentFunnel.js';
import { STUDENT as SF } from '../src/lib/airtableFields.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const PROD_BASE_ID = 'appaGfKj4vYhMw0cb';
const PROD_STUDENTS_TABLE_ID = 'tblzYmBGmCxx2vdcr';

const QA_NATIONAL_ID = `QA${Date.now().toString().slice(-10)}`;
const QA_NAME = 'Qa Enrollment Probe';

function loadPat() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) throw new Error('Missing .env.local');
  const text = readFileSync(path, 'utf8');
  const get = (key) => text.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim().replace(/^["']|["']$/g, '') ?? '';
  return get('AIRTABLE_API_KEY') || get('VITE_AIRTABLE_PAT') || get('VITE_AIRTABLE_API_KEY');
}

const pat = loadPat();
if (!pat) {
  console.error('Missing PAT');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${pat}`,
  'Content-Type': 'application/json',
  Accept: 'application/json',
};

async function api(path, { method = 'GET', body } = {}) {
  const url = `https://api.airtable.com/v0/${PROD_BASE_ID}/${path}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${res.status} ${data?.error?.message || JSON.stringify(data).slice(0, 300)}`);
  }
  return data;
}

function assert(cond, msg) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function lookup(nationalId, studentName) {
  const formula = buildIdentityLookupFormula(nationalId, studentName);
  const qs = new URLSearchParams({ filterByFormula: formula, maxRecords: '5' });
  const data = await api(`${encodeURIComponent(PROD_STUDENTS_TABLE_ID)}?${qs}`);
  return data.records ?? [];
}

async function main() {
  const steps = [];
  let recordId = null;

  console.log('═══════════════════════════════════════════════════');
  console.log(' Enrollment Funnel smoke test (PRODUCTION)');
  console.log('═══════════════════════════════════════════════════');
  console.log(` Base: ${PROD_BASE_ID}`);
  console.log(` Table: ${PROD_STUDENTS_TABLE_ID}`);
  console.log(` QA national_id: ${QA_NATIONAL_ID}`);
  console.log(` QA student_name: ${QA_NAME}`);
  console.log('');

  try {
    // 1) Identity fields writable
    const created = await api(encodeURIComponent(PROD_STUDENTS_TABLE_ID), {
      method: 'POST',
      body: {
        typecast: true,
        fields: {
          [SF.name]: QA_NAME,
          [SF.national_id]: QA_NATIONAL_ID,
          [SF.id]: `AUN-QA-${QA_NATIONAL_ID.slice(-4)}`,
          [SF.status]: 'new',
          [SF.subscription_status]: 'pending',
          [SF.comprehensive_assessment_status]: 'not_started',
          [SF.preferred_destination]: 'media',
          [SF.age]: 8,
          [SF.diagnosis]: 'under_assessment',
          [SF.parent_phone]: '500000000',
          [SF.parent_country_code]: '968',
        },
      },
    });
    recordId = created.id;
    steps.push('CREATE_OK');
    console.log(` ✓ Create student record ${recordId}`);

    // 2) Lookup by national_id + student_name
    const found = await lookup(QA_NATIONAL_ID, QA_NAME);
    assert(found.length >= 1, 'lookup returned 0 rows');
    assert(found.some((r) => r.id === recordId), 'lookup missed created row');
    steps.push('LOOKUP_OK');
    console.log(` ✓ Identity lookup (national_id + student_name)`);

    // 3) Funnel phase: pending + no score → assessment
    let phase = resolveFunnelPhase(created.fields);
    assert(phase.phase === FUNNEL_PHASES.ASSESSMENT, `expected assessment, got ${phase.phase}`);
    steps.push('PHASE_ASSESSMENT_OK');
    console.log(` ✓ Funnel phase after create: ${phase.phase} (${phase.reason})`);

    // 4) Write initial assessment score
    const scored = await api(`${encodeURIComponent(PROD_STUDENTS_TABLE_ID)}/${recordId}`, {
      method: 'PATCH',
      body: {
        typecast: true,
        fields: {
          [SF.initial_assessment_score]: 42,
          [SF.comprehensive_assessment_status]: 'not_started',
        },
      },
    });
    phase = resolveFunnelPhase(scored.fields);
    assert(phase.phase === FUNNEL_PHASES.ACTIVATION, `expected activation, got ${phase.phase}`);
    steps.push('PHASE_ACTIVATION_OK');
    console.log(` ✓ After score → funnel: ${phase.phase}`);

    // 5) Activate + mark comprehensive completed → bypass islands
    const activated = await api(`${encodeURIComponent(PROD_STUDENTS_TABLE_ID)}/${recordId}`, {
      method: 'PATCH',
      body: {
        typecast: true,
        fields: {
          [SF.subscription_status]: 'active',
          [SF.plan_code]: 'tutor',
          [SF.comprehensive_assessment_status]: 'completed',
          [SF.preferred_destination]: 'classrooms',
        },
      },
    });
    phase = resolveFunnelPhase(activated.fields);
    assert(phase.bypassAssessment === true, 'expected bypassAssessment');
    assert(
      phase.phase === FUNNEL_PHASES.CLASSROOMS || phase.landingSection === 'classrooms',
      `expected classrooms bypass, got ${phase.phase}/${phase.landingSection}`
    );
    steps.push('BYPASS_CLASSROOMS_OK');
    console.log(` ✓ Active + completed → bypass: ${phase.phase} → ${phase.landingSection}`);

    // 6) Islands path
    const islands = await api(`${encodeURIComponent(PROD_STUDENTS_TABLE_ID)}/${recordId}`, {
      method: 'PATCH',
      body: {
        typecast: true,
        fields: { [SF.preferred_destination]: 'media' },
      },
    });
    phase = resolveFunnelPhase(islands.fields);
    assert(phase.phase === FUNNEL_PHASES.ISLANDS, `expected islands, got ${phase.phase}`);
    steps.push('BYPASS_ISLANDS_OK');
    console.log(` ✓ preferred_destination=media → ${phase.phase}`);

    // 7) Duplicate identity lock: second create with same keys should be findable (no silent dup for lookup)
    const dupLookup = await lookup(normalizeNationalId(QA_NATIONAL_ID), normalizeEnglishStudentName(QA_NAME));
    assert(dupLookup.length === 1, `expected exactly 1 identity match, got ${dupLookup.length}`);
    steps.push('DEDUP_OK');
    console.log(` ✓ Dedup lock: exactly 1 row for QA identity`);

    console.log('\n═══════════════════════════════════════════════════');
    console.log(' RESULT: PASS');
    console.log(` Steps: ${steps.join(' → ')}`);
    console.log('═══════════════════════════════════════════════════');
  } catch (err) {
    console.error('\n RESULT: FAIL');
    console.error(err.message);
    console.error(` Completed steps: ${steps.join(' → ') || '—'}`);
    process.exitCode = 1;
  } finally {
    if (recordId) {
      try {
        await api(`${encodeURIComponent(PROD_STUDENTS_TABLE_ID)}/${recordId}`, { method: 'DELETE' });
        console.log(`\n ✓ Cleaned up QA record ${recordId}`);
      } catch (err) {
        console.warn(`\n ! Could not delete QA record ${recordId}: ${err.message}`);
        console.warn('   Delete manually in Airtable (national_id starts with QA).');
      }
    }
  }
}

main();
