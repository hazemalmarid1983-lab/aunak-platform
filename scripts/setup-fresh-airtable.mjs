/**
 * Fresh Airtable account setup — bootstrap base + seed demo rows.
 *
 * Prerequisites (5 min manual):
 *   1. https://airtable.com/signup — new free account
 *   2. Create empty base → copy Base ID from URL (appXXXXXXXX)
 *   3. https://airtable.com/create/tokens — PAT with:
 *        data.records:read · data.records:write
 *        schema.bases:read · schema.bases:write
 *      → Access: your new base only
 *   4. .env.local:
 *        AIRTABLE_API_KEY=pat…
 *        AUNAK_CENTRAL_BASE_ID=app…   (optional — pass --base app…)
 *
 * Usage:
 *   node scripts/setup-fresh-airtable.mjs --dry-run
 *   node scripts/setup-fresh-airtable.mjs --apply
 *   node scripts/setup-fresh-airtable.mjs --apply --base appXXXXXXXX
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ENV_PATH = resolve(ROOT, '.env.local');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const baseFlag = args.find((a, i) => args[i - 1] === '--base') || '';

function loadEnvText() {
  if (!existsSync(ENV_PATH)) return '';
  return readFileSync(ENV_PATH, 'utf8');
}

function getEnv(text, key) {
  const m = text.match(new RegExp(`^${key}=(.*)$`, 'm'));
  if (!m) return '';
  return m[1].trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '');
}

function upsertEnv(key, value) {
  if (!value) return;
  let text = loadEnvText();
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(text)) text = text.replace(re, `${key}=${value}`);
  else text = `${text.trimEnd()}\n${key}=${value}\n`;
  writeFileSync(ENV_PATH, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
}

function loadEnvIntoProcess() {
  const text = loadEnvText();
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    process.env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
}

function runNode(script, extraArgs = []) {
  loadEnvIntoProcess();
  const r = spawnSync(process.execPath, [resolve(ROOT, script), ...extraArgs], {
    cwd: ROOT,
    stdio: 'inherit',
    env: { ...process.env },
  });
  if (r.status !== 0) {
    throw new Error(`${script} exited ${r.status}`);
  }
}

async function probePat(pat, baseId) {
  const res = await fetch(`https://api.airtable.com/v0/meta/bases/${baseId}/tables`, {
    headers: { Authorization: `Bearer ${pat}`, Accept: 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function listWorkspaces(pat) {
  const res = await fetch('https://api.airtable.com/v0/meta/workspaces', {
    headers: { Authorization: `Bearer ${pat}`, Accept: 'application/json' },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.workspaces ?? [];
}

async function createEmptyBase(pat, workspaceId) {
  const res = await fetch('https://api.airtable.com/v0/meta/bases', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      name: 'Aunak Sovereign',
      workspaceId,
      tables: [
        {
          name: 'Centers',
          fields: [{ name: 'center_name', type: 'singleLineText' }],
        },
      ],
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Create base failed (${res.status}): ${data?.error?.message || JSON.stringify(data)}`);
  }
  return data.id;
}

async function main() {
  console.log('═══════════════════════════════════════════════════');
  console.log(' Aunak — Fresh Airtable Account Setup');
  console.log('═══════════════════════════════════════════════════\n');
  console.log(APPLY ? 'Mode: APPLY (writes schema + seed)' : 'Mode: DRY-RUN\n');

  const envText = loadEnvText();
  const pat =
    getEnv(envText, 'AIRTABLE_API_KEY') ||
    getEnv(envText, 'VITE_AIRTABLE_PAT') ||
    getEnv(envText, 'VITE_AIRTABLE_API_KEY');

  if (!pat || !pat.startsWith('pat')) {
    console.error('❌ Missing AIRTABLE_API_KEY=pat… in .env.local');
    console.log('\nManual steps first:');
    console.log('  1. https://airtable.com/signup');
    console.log('  2. Create base → copy app… from URL');
    console.log('  3. https://airtable.com/create/tokens (all 4 scopes + base access)');
    console.log('  4. Add to .env.local: AIRTABLE_API_KEY=pat…');
    console.log('  5. Re-run: node scripts/setup-fresh-airtable.mjs --apply --base app…');
    process.exit(1);
  }

  let baseId =
    baseFlag ||
    getEnv(envText, 'AUNAK_CENTRAL_BASE_ID') ||
    getEnv(envText, 'AIRTABLE_BASE_ID') ||
    getEnv(envText, 'VITE_AIRTABLE_BASE_ID');

  if (!baseId && APPLY) {
    console.log('No base ID — creating "Aunak Sovereign" base via API…');
    const workspaces = await listWorkspaces(pat);
    if (!workspaces.length) {
      console.error('❌ PAT cannot list workspaces. Create a base manually and pass --base app…');
      process.exit(1);
    }
    baseId = await createEmptyBase(pat, workspaces[0].id);
    console.log(`✅ Created base: ${baseId}`);
    upsertEnv('AUNAK_CENTRAL_BASE_ID', baseId);
    upsertEnv('AIRTABLE_BASE_ID', baseId);
    upsertEnv('VITE_AIRTABLE_BASE_ID', baseId);
  }

  if (!baseId) {
    console.log('Set AUNAK_CENTRAL_BASE_ID=app… in .env.local or pass --base app…');
    process.exit(1);
  }

  console.log(`Base: ${baseId}`);
  console.log(`PAT:  set (${pat.length} chars)\n`);

  const probe = await probePat(pat, baseId);
  if (!probe.ok) {
    const msg = probe.data?.error?.message || JSON.stringify(probe.data);
    console.error(`❌ Cannot access base (${probe.status}): ${msg}`);
    if (probe.status === 403) {
      console.log('\n→ Edit PAT at airtable.com/create/tokens → add this base to token access.');
    }
    if (probe.status === 429) {
      console.log('\n→ Quota exceeded on this PAT/workspace. Use a brand-new free account.');
    }
    process.exit(1);
  }
  console.log(`✅ Base reachable (${(probe.data.tables ?? []).length} table(s))\n`);

  if (!getEnv(loadEnvText(), 'B2G_HMAC_SALT')) {
    upsertEnv('B2G_HMAC_SALT', 'aunak-b2g-sovereign-live-2026');
  }
  upsertEnv('VITE_USE_AIRTABLE_PROXY', 'true');

  const bootstrapArgs = APPLY ? ['--apply'] : ['--dry-run'];
  console.log('── Step 1/3: Bootstrap schema (9 tables) ──');
  process.env.AUNAK_CENTRAL_BASE_ID = baseId;
  process.env.AIRTABLE_BASE_ID = baseId;
  process.env.VITE_AIRTABLE_BASE_ID = baseId;
  runNode('scripts/bootstrap-central-base.mjs', bootstrapArgs);

  if (APPLY) {
    console.log('\n── Step 2/3: Extend Students (P2 fields) ──');
    runNode('scripts/extend-students-schema-production.mjs', ['--apply']);

    console.log('\n── Step 3/3: Seed demo rows + login tokens ──');
    runNode('scripts/seed-live-operational-data.mjs', ['--apply']);
  } else {
    console.log('\n(Dry-run — re-run with --apply to write schema + seed)');
  }

  console.log('\n═══════════════════════════════════════════════════');
  console.log(' Next: npm run dev → login with tokens printed above');
  console.log('       (or MOCK-* if you enable MOCK_DATA_MODE)');
  console.log('\n Vercel: update AIRTABLE_API_KEY + AIRTABLE_BASE_ID + table IDs');
  console.log('         from .env.local then: npx vercel deploy --prod');
  console.log('═══════════════════════════════════════════════════\n');
}

main().catch((e) => {
  console.error('FAILED:', e.message || e);
  process.exit(1);
});
