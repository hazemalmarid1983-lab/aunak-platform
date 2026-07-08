#!/usr/bin/env node
/**
 * Provision (or verify) ministry_auditor in Access Control — B2G live audit login.
 *
 * Usage:
 *   node scripts/provision-ministry-auditor.mjs
 *   node scripts/provision-ministry-auditor.mjs --token AUN-AUD-2026-MINISTRY
 *
 * Requires AIRTABLE_API_KEY or VITE_AIRTABLE_PAT in .env.local / .env
 *
 * Schema (snake_case — src/lib/airtableFields.js):
 *   access_token · access_level · user_name · user_email · status · permissions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const BASE_ID = 'appaGfKj4vYhMw0cb';
const ACCESS_TABLE = 'tblfBvd5WI7alVCFU';
const DEFAULT_TOKEN = 'AUN-AUD-2026-MINISTRY';
const DEFAULT_NAME = 'مفتش وزارة التنمية الاجتماعية';
const DEFAULT_EMAIL = 'ministry.auditor@aunak-center.com';

/** Read .env.local then .env — no dotenv dependency. */
function loadEnv() {
  const envPaths = [
    path.join(projectRoot, '.env.local'),
    path.join(projectRoot, '.env'),
  ];

  for (const envPath of envPaths) {
    if (!fs.existsSync(envPath)) continue;
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = match[2] ?? '';
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (!process.env[key]) process.env[key] = value.trim();
    }
  }
}

function parseArgs(argv) {
  const out = {
    token: DEFAULT_TOKEN,
    email: DEFAULT_EMAIL,
    name: DEFAULT_NAME,
    dryRun: false,
    force: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--token' || a === '-t') out.token = String(argv[++i] ?? out.token).trim();
    else if (a === '--email' || a === '-e') out.email = String(argv[++i] ?? out.email).trim();
    else if (a === '--name' || a === '-n') out.name = String(argv[++i] ?? out.name).trim();
    else if (a === '--dry-run') out.dryRun = true;
    else if (a === '--force') out.force = true;
    else if (a === '--help' || a === '-h') out.help = true;
  }
  return out;
}

async function airtableFetch(pat, baseId, tableId, init = {}) {
  const url = `https://api.airtable.com/v0/${baseId}/${tableId}${init.pathSuffix ?? ''}`;
  const res = await fetch(url, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${pat}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
    body: init.body,
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok) {
    const msg = typeof body === 'object' ? JSON.stringify(body, null, 2) : body;
    throw new Error(`Airtable ${res.status}: ${msg}`);
  }
  return body;
}

async function findExistingAuditor(pat, baseId, { token, email }) {
  const esc = (s) => String(s).replace(/'/g, "\\'");
  const formula = encodeURIComponent(
    `OR({access_token}='${esc(token)}', {access_level}='ministry_auditor', LOWER({user_email})='${esc(email.toLowerCase())}')`
  );
  const data = await airtableFetch(pat, baseId, ACCESS_TABLE, {
    pathSuffix: `?maxRecords=5&filterByFormula=${formula}`,
  });
  return data.records?.[0] ?? null;
}

function printSuccess({ recordId, token, name, email, created }) {
  console.log('\n==================================================');
  if (created) {
    console.log('🎉 تم تفعيل وحقن حساب مفتش الوزارة السيادي بنجاح حياً!');
  } else {
    console.log('✓ حساب مفتش الوزارة موجود مسبقاً — جاهز للاختبار');
  }
  console.log('==================================================');
  console.log(`🔑 رمز الدخول (access_token): ${token}`);
  console.log(`🛡️ الدور (access_level): ministry_auditor`);
  console.log(`👤 الاسم (user_name): ${name}`);
  console.log(`📧 البريد (user_email): ${email}`);
  console.log(`📊 معرف السجل: ${recordId}`);
  console.log('==================================================');
  console.log('→ سجّل الدخول في بوابة عونك أو /ministry بهذا الرمز');
  console.log('→ تأكد من خيار ministry_auditor في access_level بـ Airtable');
  console.log('→ على Vercel: B2G_HMAC_SALT + AIRTABLE_API_KEY + VITE_USE_AIRTABLE_PROXY=true\n');
}

async function main() {
  loadEnv();

  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(`
Ministry auditor provisioner (B2G)
──────────────────────────────────
  node scripts/provision-ministry-auditor.mjs [--token AUN-AUD-2026-MINISTRY]

Creates Access Control row (snake_case fields, status=active lowercase).
`);
    process.exit(0);
  }

  const pat = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const baseId =
    process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID || BASE_ID;

  if (!pat) {
    console.error(
      '❌ خطأ: لم يُعثر على AIRTABLE_API_KEY أو VITE_AIRTABLE_PAT في .env.local / .env'
    );
    process.exit(1);
  }

  const existing = await findExistingAuditor(pat, baseId, {
    token: args.token,
    email: args.email,
  });

  if (existing && !args.force) {
    const f = existing.fields ?? {};
    printSuccess({
      recordId: existing.id,
      token: f.access_token ?? args.token,
      name: f.user_name ?? args.name,
      email: f.user_email ?? args.email,
      created: false,
    });
    return;
  }

  const fields = {
    user_name: args.name,
    user_email: args.email,
    status: 'active',
    access_level: 'ministry_auditor',
    permissions: 'B2G read-only — ministry live audit',
    access_token: args.token,
  };

  if (args.dryRun) {
    console.log('[dry-run] Would POST:', JSON.stringify({ fields }, null, 2));
    return;
  }

  console.log('⏳ جاري الاتصال بـ Airtable لحقن حساب المفتش المعتمد...');

  const created = await airtableFetch(pat, baseId, ACCESS_TABLE, {
    method: 'POST',
    body: JSON.stringify({ fields }),
  });

  printSuccess({
    recordId: created.id,
    token: args.token,
    name: args.name,
    email: args.email,
    created: true,
  });
}

main().catch((err) => {
  console.error('❌ فشلت عملية الحقن في Airtable:');
  console.error(err.message || err);
  process.exit(1);
});
