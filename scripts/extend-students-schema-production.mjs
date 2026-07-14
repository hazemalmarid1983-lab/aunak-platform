/**
 * Production Students schema — safe P0 + P1 field extension.
 *
 * Target (hard-locked to sovereign production):
 *   Base:  appaGfKj4vYhMw0cb
 *   Table: tblzYmBGmCxx2vdcr  (جدول الطالب / Students)
 *
 * Safety rules:
 *   - NEVER deletes fields
 *   - NEVER renames fields
 *   - NEVER removes existing select choices (only merges missing options)
 *   - Creates missing fields only (idempotent)
 *   - Does NOT convert field types (e.g. plan_code stays singleLineText)
 *
 * Usage:
 *   node scripts/extend-students-schema-production.mjs --dry-run
 *   node scripts/extend-students-schema-production.mjs --apply
 *
 * Requires PAT with schema.bases:read + schema.bases:write on the production base.
 * Reads AIRTABLE_API_KEY or VITE_AIRTABLE_PAT from .env.local (key only — base/table locked).
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

/** Sovereign production — do not override via env (prevents sandbox accidents). */
const PROD_BASE_ID = 'appaGfKj4vYhMw0cb';
const PROD_STUDENTS_TABLE_ID = 'tblzYmBGmCxx2vdcr';
const PROD_SPECIALISTS_TABLE_ID = 'tblnmcLd5M3U6sErl';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply') || args.has('--force-apply');
const DRY_RUN = !APPLY;

function loadPat() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) {
    console.error('Missing .env.local (need AIRTABLE_API_KEY or VITE_AIRTABLE_PAT)');
    process.exit(1);
  }
  const text = readFileSync(path, 'utf8');
  const get = (key) => {
    const m = text.match(new RegExp(`^${key}=(.+)$`, 'm'));
    return m?.[1]?.trim().replace(/^["']|["']$/g, '') ?? '';
  };
  return get('AIRTABLE_API_KEY') || get('VITE_AIRTABLE_PAT') || get('VITE_AIRTABLE_API_KEY');
}

const pat = loadPat();
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

/** Fields to CREATE if missing (P0 + P1). Never delete. */
const FIELDS_TO_CREATE = [
  // —— P0 ——
  {
    name: 'national_id',
    type: 'singleLineText',
    description: 'P0 — civil/national ID; sole enrollment upsert key',
  },
  {
    name: 'student_name_ar',
    type: 'singleLineText',
    description: 'P0 — Arabic display name on same Students row as student_name (EN)',
  },

  // —— P1 sessions / mirror / goals ——
  {
    name: 'programmed_goal',
    type: 'multilineText',
    description: 'P1 — Active IEP / programmed clinical goal',
  },
  {
    name: 'mirror_command',
    type: 'singleSelect',
    options: selectChoices('echo_goal', 'drop_star', 'drop_reward', 'calm_pulse', 'clear'),
    description: 'P1 — Ghost Mirror command (specialist → child)',
  },
  {
    name: 'mirror_payload',
    type: 'singleLineText',
    description: 'P1 — Ghost Mirror payload / goal echo text',
  },
  {
    name: 'clinical_session_notes',
    type: 'multilineText',
    description: 'P1 — ABC / clinical session free-text notes',
  },
  {
    name: 'session_start_time',
    type: 'singleLineText',
    description: 'P1 — session start timestamp display',
  },
  {
    name: 'clinical_session_status',
    type: 'singleSelect',
    options: selectChoices('idle', 'live', 'sealed', 'closed'),
    description: 'P1 — clinical session lifecycle',
  },
  {
    name: 'smart_session_fields',
    type: 'number',
    options: { precision: 0 },
    description: 'P1 — smart session field counter',
  },
  {
    name: 'biometric_attendance_verified',
    type: 'checkbox',
    options: { color: 'greenBright', icon: 'check' },
    description: 'P1 — live biometric attendance flag',
  },
  {
    name: 'biometric_attendance_at',
    type: 'dateTime',
    options: { timeZone: 'Asia/Muscat', dateFormat: { name: 'iso' }, timeFormat: { name: '24hour' } },
    description: 'P1 — biometric attendance timestamp',
  },
  {
    name: 'ai_session_report',
    type: 'multilineText',
    description: 'P1 — AI session brief report',
  },
  {
    name: 'payment_status',
    type: 'singleSelect',
    options: selectChoices('pending', 'paid', 'unpaid', 'waived'),
    description: 'P1 — session/consultative payment status',
  },
  {
    name: 'session_fee',
    type: 'number',
    options: { precision: 2 },
    description: 'P1 — session fee amount',
  },
  {
    name: 'assigned_class',
    type: 'singleLineText',
    description: 'P1 — classroom assignment label',
  },
  {
    name: 'assigned_specialist',
    type: 'multipleRecordLinks',
    options: {
      linkedTableId: PROD_SPECIALISTS_TABLE_ID,
    },
    description: 'P1 — link → Specialists (الأخصائيين)',
  },
];

/**
 * Existing singleSelect fields: MERGE missing choices only (keep legacy options).
 * Never removes Arabic/legacy choices.
 */
const SELECT_OPTION_MERGES = [
  {
    name: 'preferred_destination',
    ensure: ['media', 'registry', 'community', 'diagnostics', 'classrooms'],
  },
  {
    name: 'subscription_status',
    ensure: ['pending', 'active'],
  },
  {
    name: 'biometric_status',
    ensure: ['approved'],
  },
  {
    name: 'comprehensive_assessment_status',
    ensure: ['not_started', 'in_progress', 'completed'],
  },
  {
    name: 'status',
    ensure: ['new', 'active'],
  },
  {
    name: 'plan_code',
    /** Only merge if field is already singleSelect; skip if still singleLineText */
    ensure: ['free', 'tutor', 'medical', 'institution', 'assessment_only'],
    skipIfNotSelect: true,
  },
];

async function fetchStudentsTable() {
  const meta = await api(`https://api.airtable.com/v0/meta/bases/${PROD_BASE_ID}/tables`);
  const table = (meta.tables ?? []).find((t) => t.id === PROD_STUDENTS_TABLE_ID);
  if (!table) throw new Error(`Students table ${PROD_STUDENTS_TABLE_ID} not found in base ${PROD_BASE_ID}`);
  return table;
}

async function createField(fieldDef) {
  const { description, ...body } = fieldDef;
  // Airtable Meta create may ignore description on some plans — still include if supported
  const payload = description ? { ...body, description } : body;
  return api(
    `https://api.airtable.com/v0/meta/bases/${PROD_BASE_ID}/tables/${PROD_STUDENTS_TABLE_ID}/fields`,
    { method: 'POST', body: JSON.stringify(payload) }
  );
}

async function mergeSelectChoices(field, ensureNames) {
  if (field.type !== 'singleSelect') {
    return { skipped: true, reason: `type=${field.type}` };
  }
  const existing = field.options?.choices ?? [];
  const existingNames = new Set(existing.map((c) => String(c.name)));
  const missing = ensureNames.filter((n) => !existingNames.has(n));
  if (missing.length === 0) {
    return { skipped: true, reason: 'all choices present', missing: [] };
  }

  // Preserve existing choice objects (with ids) + append new names
  // Do not send undefined color — Airtable PATCH validates strictly.
  const nextChoices = [
    ...existing.map((c) => {
      const row = { id: c.id, name: c.name };
      if (c.color) row.color = c.color;
      return row;
    }),
    ...missing.map((name) => ({ name })),
  ];

  if (DRY_RUN || !APPLY) {
    return { dryRun: true, missing };
  }

  await api(
    `https://api.airtable.com/v0/meta/bases/${PROD_BASE_ID}/tables/${PROD_STUDENTS_TABLE_ID}/fields/${field.id}`,
    {
      method: 'PATCH',
      body: JSON.stringify({
        type: 'singleSelect',
        options: { choices: nextChoices },
      }),
    }
  );
  return { applied: true, missing };
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log(' Aunak Production Students — P0/P1 schema extend');
  console.log('═══════════════════════════════════════════════════');
  console.log(` Base:  ${PROD_BASE_ID}`);
  console.log(` Table: ${PROD_STUDENTS_TABLE_ID}`);
  console.log(` Mode:  ${APPLY && !DRY_RUN ? 'APPLY (writes enabled)' : 'DRY-RUN (no writes)'}`);
  console.log('');

  if (!APPLY) {
    console.log(' Tip: re-run with --apply to execute writes.');
    console.log('');
  }

  const table = await fetchStudentsTable();
  const byName = new Map((table.fields ?? []).map((f) => [f.name, f]));
  console.log(` Loaded "${table.name}" — ${byName.size} existing fields\n`);

  const report = { created: [], existed: [], merged: [], skipped: [], errors: [] };

  // 1) Create missing fields
  console.log('── Create missing fields (P0 + P1) ──');
  for (const def of FIELDS_TO_CREATE) {
    if (byName.has(def.name)) {
      console.log(`  ✓ ${def.name} (exists, type=${byName.get(def.name).type})`);
      report.existed.push(def.name);
      continue;
    }
    if (!APPLY) {
      console.log(`  · would create ${def.name} (${def.type})`);
      report.created.push(`dry:${def.name}`);
      continue;
    }
    try {
      const created = await createField(def);
      console.log(`  + created ${def.name} (${created.type || def.type})`);
      report.created.push(def.name);
      byName.set(def.name, created);
      // brief pause to avoid rate limits
      await new Promise((r) => setTimeout(r, 250));
    } catch (err) {
      console.error(`  ✗ ${def.name}: ${err.message}`);
      report.errors.push({ field: def.name, error: err.message });
    }
  }

  // Refresh schema after creates
  const refreshed = APPLY ? await fetchStudentsTable() : table;
  const fieldsNow = new Map((refreshed.fields ?? []).map((f) => [f.name, f]));

  // 2) Merge select options
  console.log('\n── Merge select options (keep legacy choices) ──');
  for (const spec of SELECT_OPTION_MERGES) {
    const field = fieldsNow.get(spec.name);
    if (!field) {
      console.log(`  · ${spec.name} — field missing (skipped)`);
      report.skipped.push({ field: spec.name, reason: 'missing' });
      continue;
    }
    if (spec.skipIfNotSelect && field.type !== 'singleSelect') {
      console.log(`  · ${spec.name} — type=${field.type} (not converting; leave as-is)`);
      report.skipped.push({ field: spec.name, reason: `type=${field.type}` });
      continue;
    }
    try {
      const result = await mergeSelectChoices(field, spec.ensure);
      if (result.skipped && result.reason === 'all choices present') {
        console.log(`  ✓ ${spec.name} — options OK`);
      } else if (result.dryRun) {
        console.log(`  · would add to ${spec.name}: ${result.missing.join(', ')}`);
        report.merged.push({ field: spec.name, missing: result.missing, dry: true });
      } else if (result.applied) {
        console.log(`  + ${spec.name} — added: ${result.missing.join(', ')}`);
        report.merged.push({ field: spec.name, missing: result.missing });
      } else if (result.skipped) {
        console.log(`  · ${spec.name} — skipped (${result.reason})`);
        report.skipped.push({ field: spec.name, reason: result.reason });
      }
      await new Promise((r) => setTimeout(r, 200));
    } catch (err) {
      console.error(`  ✗ ${spec.name} options: ${err.message}`);
      report.errors.push({ field: spec.name, error: err.message });
    }
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(' Summary');
  console.log('═══════════════════════════════════════════════════');
  console.log(` Existed:  ${report.existed.length}`);
  console.log(` Created:  ${report.created.length} → ${report.created.join(', ') || '—'}`);
  console.log(` Merged:   ${report.merged.length}`);
  console.log(` Skipped:  ${report.skipped.length}`);
  console.log(` Errors:   ${report.errors.length}`);
  if (report.errors.length) {
    for (const e of report.errors) console.log(`   - ${e.field}: ${e.error}`);
    process.exitCode = 1;
  } else if (!APPLY) {
    console.log('\n Dry-run complete. Run with --apply to write to production.');
  } else {
    console.log('\n Production schema extend complete. No fields were deleted.');
  }

  if (report.errors.some((e) => /403/.test(e.error))) {
    console.log(`
╔════════════════════════════════════════════════════════════════╗
║  PAT lacks schema.bases:write on base ${PROD_BASE_ID}
║
║  Fix (Airtable → Developer hub → Personal access tokens):
║    1. Edit the PAT used in .env.local
║    2. Enable scope: schema.bases:write  (+ keep schema.bases:read)
║    3. Grant access to base appaGfKj4vYhMw0cb
║    4. Re-run: npm run schema:students:apply
║
║  Or add fields manually from the checklist printed in the chat.
╚════════════════════════════════════════════════════════════════╝`);
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});
