#!/usr/bin/env node
/**
 * Provision (or verify) a ministry_auditor row in Access Control for B2G live testing.
 *
 * Usage:
 *   node scripts/provision-ministry-auditor.mjs
 *   node scripts/provision-ministry-auditor.mjs --email inspector@ministry.gov.sa --name "Ministry Inspector"
 *
 * Requires AIRTABLE_API_KEY or VITE_AIRTABLE_PAT in .env.local (server PAT preferred).
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASE_ID = 'appaGfKj4vYhMw0cb';
const ACCESS_TABLE = 'tblfBvd5WI7alVCFU';

function loadPat() {
  const envPath = resolve(ROOT, '.env.local');
  if (!existsSync(envPath)) return process.env.AIRTABLE_API_KEY || '';
  const text = readFileSync(envPath, 'utf8');
  const server = text.match(/^AIRTABLE_API_KEY=(.+)$/m)?.[1]?.trim();
  const client = text.match(/^VITE_AIRTABLE_PAT=(.+)$/m)?.[1]?.trim();
  return server || client || process.env.AIRTABLE_API_KEY || '';
}

function parseArgs(argv) {
  const out = {
    email: 'ministry.inspector@aunak-center.com',
    name: 'Ministry B2G Inspector',
    dryRun: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--email' || a === '-e') out.email = String(argv[++i] ?? out.email).trim();
    else if (a === '--name' || a === '-n') out.name = String(argv[++i] ?? out.name).trim();
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

function newAccessToken() {
  return `AUN-MIN-${randomBytes(16).toString('hex').toUpperCase()}`;
}

async function airtableFetch(pat, path, init = {}) {
  const url = `https://api.airtable.com/v0/${BASE_ID}/${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = typeof body === 'object' ? JSON.stringify(body) : body;
    throw new Error(`Airtable ${res.status}: ${msg}`);
  }
  return body;
}

async function findExistingAuditor(pat, email) {
  const formula = encodeURIComponent(
    `OR({access_level}='ministry_auditor', LOWER({user_email})='${email.toLowerCase().replace(/'/g, "\\'")}')`
  );
  const data = await airtableFetch(
    pat,
    `${ACCESS_TABLE}?maxRecords=5&filterByFormula=${formula}`
  );
  return data.records?.[0] ?? null;
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`
Ministry auditor provisioner (B2G)
──────────────────────────────────
  node scripts/provision-ministry-auditor.mjs [--email addr] [--name "Display Name"]

Creates Access Control row with access_level=ministry_auditor (lowercase select).
Login token: use access_token value printed after success.
`);
    process.exit(0);
  }

  const pat = loadPat();
  if (!pat) {
    console.error('Missing AIRTABLE_API_KEY or VITE_AIRTABLE_PAT in .env.local');
    process.exit(1);
  }

  const existing = await findExistingAuditor(pat, args.email);
  if (existing) {
    const f = existing.fields ?? {};
    console.log('✓ ministry_auditor already exists');
    console.log(`  recordId: ${existing.id}`);
    console.log(`  user_email: ${f.user_email ?? '—'}`);
    console.log(`  access_level: ${f.access_level ?? '—'}`);
    console.log(`  access_token: ${f.access_token ?? '—'}`);
    console.log('\nUse access_token (or email) on the Hub login gate for B2G testing.');
    return;
  }

  const token = newAccessToken();
  const fields = {
    user_name: args.name,
    user_email: args.email,
    status: 'active',
    access_level: 'ministry_auditor',
    permissions: 'B2G read-only — ministry inspector',
    access_token: token,
  };

  if (args.dryRun) {
    console.log('[dry-run] Would create:', JSON.stringify(fields, null, 2));
    return;
  }

  const created = await airtableFetch(pat, ACCESS_TABLE, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });

  console.log('✓ Created ministry_auditor Access Control record');
  console.log(`  recordId: ${created.id}`);
  console.log(`  user_email: ${args.email}`);
  console.log(`  access_token: ${token}`);
  console.log('\nBefore login: add "ministry_auditor" as a select option on access_level if Airtable rejects the write.');
  console.log('After deploy: set B2G_HMAC_SALT on Vercel, then login with the token above.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
