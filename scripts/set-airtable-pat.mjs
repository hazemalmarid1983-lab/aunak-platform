/**
 * Update Airtable PAT + base IDs in .env.local (never commit this file).
 * Usage: node scripts/set-airtable-pat.mjs <pat> [baseId app…]
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const pat = String(process.argv[2] || '').trim();
if (!pat.startsWith('pat')) {
  console.error('Usage: node scripts/set-airtable-pat.mjs pat...');
  process.exit(1);
}

const path = resolve('.env.local');
let text = existsSync(path) ? readFileSync(path, 'utf8') : '';

function upsert(key, value) {
  const re = new RegExp(`^${key}=.*$`, 'm');
  if (re.test(text)) text = text.replace(re, `${key}=${value}`);
  else text = `${text.trimEnd()}\n${key}=${value}\n`;
}

upsert('AIRTABLE_API_KEY', pat);
upsert('VITE_AIRTABLE_PAT', pat);
if (process.argv[3]) {
  upsert('AUNAK_CENTRAL_BASE_ID', process.argv[3]);
  upsert('AIRTABLE_BASE_ID', process.argv[3]);
  upsert('VITE_AIRTABLE_BASE_ID', process.argv[3]);
}
upsert('VITE_USE_AIRTABLE_PROXY', 'true');
if (!/^B2G_HMAC_SALT=/m.test(text)) {
  upsert('B2G_HMAC_SALT', 'aunak-b2g-sovereign-live-2026');
}

writeFileSync(path, text.endsWith('\n') ? text : `${text}\n`, 'utf8');
console.log('Updated .env.local (PAT + central base). keyLen=', pat.length);
