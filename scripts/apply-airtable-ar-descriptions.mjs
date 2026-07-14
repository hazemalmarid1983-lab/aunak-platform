/**
 * Write Arabic descriptions onto Airtable fields (names stay English snake_case).
 *
 *   node scripts/apply-airtable-ar-descriptions.mjs --dry-run
 *   node scripts/apply-airtable-ar-descriptions.mjs --apply
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASE_ID = process.env.AUNAK_CENTRAL_BASE_ID || 'appcjitgWsbvIebwf';
const APPLY = process.argv.includes('--apply') || process.argv.includes('--force-apply');

function loadPat() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) return '';
  const text = readFileSync(path, 'utf8');
  const m =
    text.match(/^AIRTABLE_API_KEY=(.+)$/m) ||
    text.match(/^VITE_AIRTABLE_PAT=(.+)$/m) ||
    text.match(/^VITE_AIRTABLE_API_KEY=(.+)$/m);
  return m?.[1]?.trim().replace(/^["']|["']$/g, '') ?? '';
}

const pat = loadPat();
if (!pat) {
  console.error('Missing Airtable PAT in .env.local');
  process.exit(1);
}

const { FIELD_DESCRIPTIONS_AR, TABLE_LABELS_AR } = await import(
  pathToFileURL(resolve(ROOT, 'src/lib/airtableFieldDescriptionsAr.js')).href
);

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
    throw new Error(`${res.status} ${data?.error?.message || text.slice(0, 400)}`);
  }
  return data;
}

async function main() {
  console.log(APPLY ? 'APPLY Arabic descriptions' : 'DRY-RUN');
  console.log(`Base ${BASE_ID}\n`);

  const meta = await api(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables`);
  const tables = meta.tables ?? [];
  let updated = 0;
  let skipped = 0;

  for (const table of tables) {
    const map = FIELD_DESCRIPTIONS_AR[table.name];
    if (!map) {
      console.log(`· skip table (no AR map): ${table.name}`);
      continue;
    }
    const arTable = TABLE_LABELS_AR[table.name] || table.name;
    console.log(`\n▸ ${table.name} — ${arTable}`);

    // Table description (Arabic label)
    if (APPLY && (!table.description || !table.description.includes(arTable))) {
      try {
        await api(`https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${table.id}`, {
          method: 'PATCH',
          body: JSON.stringify({ description: arTable }),
        });
        console.log(`  ✓ table description → ${arTable}`);
      } catch (e) {
        console.warn(`  ! table description: ${e.message}`);
      }
    }

    for (const field of table.fields || []) {
      const ar = map[field.name];
      if (!ar) continue;
      if (field.description === ar) {
        skipped += 1;
        continue;
      }
      console.log(`  ${APPLY ? '+' : '~'} ${field.name} → ${ar}`);
      if (APPLY) {
        try {
          await api(
            `https://api.airtable.com/v0/meta/bases/${BASE_ID}/tables/${table.id}/fields/${field.id}`,
            {
              method: 'PATCH',
              body: JSON.stringify({ description: ar }),
            }
          );
          updated += 1;
        } catch (e) {
          console.warn(`  ! ${field.name}: ${e.message}`);
        }
      } else {
        updated += 1;
      }
    }
  }

  console.log(`\nDone. ${APPLY ? 'Updated' : 'Would update'}: ${updated}, already ok: ${skipped}`);
  if (!APPLY) console.log('Re-run with --apply to write descriptions.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
