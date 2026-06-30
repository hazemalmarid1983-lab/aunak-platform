/**
 * Seed Tawasul MVP Airtable base — 2 specialists, 10 students (5 each).
 *
 * Prerequisites:
 *   - New Airtable base with Specialists, Students, Daily Sessions tables (see docs/TAWASUL_MVP.md)
 *   - .env.local: VITE_AIRTABLE_PAT, VITE_AIRTABLE_BASE_ID, table IDs
 *
 * Usage: node scripts/tawasul-seed.mjs
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function loadEnv() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) {
    console.error('Missing .env.local — copy from .env.example and set Tawasul base IDs');
    process.exit(1);
  }
  const text = readFileSync(path, 'utf8');
  const get = (key) => text.match(new RegExp(`^${key}=(.+)$`, 'm'))?.[1]?.trim();
  return {
    pat: get('VITE_AIRTABLE_PAT') || get('AIRTABLE_API_KEY'),
    baseId: get('VITE_AIRTABLE_BASE_ID') || get('AIRTABLE_BASE_ID'),
    specialists: get('VITE_AIRTABLE_SPECIALISTS_TABLE_ID'),
    students: get('VITE_AIRTABLE_STUDENTS_TABLE_ID'),
  };
}

function token(prefix) {
  return `AUN-${prefix}-${randomBytes(16).toString('hex').toUpperCase()}`;
}

async function airtablePost(baseId, tableId, pat, fields) {
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ fields, typecast: true }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text.slice(0, 400));
  return JSON.parse(text);
}

const env = loadEnv();
if (!env.pat || !env.baseId || !env.specialists || !env.students) {
  console.error('Required: VITE_AIRTABLE_PAT, VITE_AIRTABLE_BASE_ID, VITE_AIRTABLE_SPECIALISTS_TABLE_ID, VITE_AIRTABLE_STUDENTS_TABLE_ID');
  process.exit(1);
}

const specialists = [
  { specialist_name: 'حازم', status: 'active' },
  { specialist_name: 'الأخصائي 2', status: 'active' },
];

console.log('Seeding Tawasul MVP base', env.baseId);

const specialistRecords = [];
for (const row of specialists) {
  const specialist_tutor_token = token('SPC');
  const rec = await airtablePost(env.baseId, env.specialists, env.pat, {
    ...row,
    specialist_tutor_token,
  });
  specialistRecords.push({ ...rec, token: specialist_tutor_token });
  console.log(`  Specialist: ${row.specialist_name} → ${specialist_tutor_token} (${rec.id})`);
}

let studentIndex = 1;
for (const spec of specialistRecords) {
  for (let i = 0; i < 5; i++) {
    const child_interactive_token = token('CHD');
    const name = `حالة تواصل ${studentIndex}`;
    const rec = await airtablePost(env.baseId, env.students, env.pat, {
      student_name: name,
      student_id: `TWS-${String(studentIndex).padStart(2, '0')}`,
      age: 6 + (studentIndex % 8),
      status: 'active',
      assigned_specialist: [spec.id],
      child_interactive_token,
      specialist_tutor_token: spec.token,
      programmed_goal: `هدف يومي للحالة ${studentIndex} — من ${spec.fields?.specialist_name ?? 'أخصائي'}`,
      comprehensive_assessment_status: 'not_started',
    });
    console.log(`  Student: ${name} → ${child_interactive_token} (${rec.id})`);
    studentIndex++;
  }
}

console.log('\nDone. Specialist login tokens:');
specialistRecords.forEach((s) => console.log(`  ${s.fields?.specialist_name}: ${s.token}`));
