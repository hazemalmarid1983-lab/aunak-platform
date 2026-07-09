/**
 * Sovereign mock payment test — simulates webhook → Airtable (standalone, no src imports).
 * Usage: node scripts/test-mock-payment.mjs [studentRecordId]
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomBytes, createHmac } from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const BASE = 'appaGfKj4vYhMw0cb';
const TABLE = 'tblzYmBGmCxx2vdcr';

function loadEnvLocal() {
  const path = resolve(ROOT, '.env.local');
  if (!existsSync(path)) return null;
  const env = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function token(prefix) {
  return `AUN-${prefix}-${randomBytes(16).toString('hex').toUpperCase()}`;
}

function buildMockChargeId() {
  return `chg_MOCK_${Date.now().toString(36).toUpperCase()}_${randomBytes(3).toString('hex').toUpperCase()}`;
}

async function airtableGet(apiKey, recordId) {
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE}/${TABLE}/${encodeURIComponent(recordId)}`,
    { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } }
  );
  if (!res.ok) return null;
  return res.json();
}

async function findPendingStudent(apiKey) {
  const filter = encodeURIComponent("{subscription_status}='pending'");
  const res = await fetch(
    `https://api.airtable.com/v0/${BASE}/${TABLE}?maxRecords=5&filterByFormula=${filter}`,
    { headers: { Authorization: `Bearer ${apiKey}`, Accept: 'application/json' } }
  );
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()).records?.[0] ?? null;
}

/** Mirrors paymentWebhookProcessor + paymentActivation + tripleAccessProtocol */
async function activateMockPayment(apiKey, studentId, chargeId, plan = 'tutor') {
  const existing = await airtableGet(apiKey, studentId);
  const f = existing?.fields ?? {};
  const ref = `MOCK-${chargeId}`;
  if (String(f.activation_code_used ?? '').trim() === ref) {
    return { alreadyActivated: true, fields: f };
  }

  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  const comprehensive = String(f.comprehensive_assessment_status ?? '').toLowerCase();

  const fields = {
    subscription_status: 'active',
    plan_code: plan,
    last_payment_at: new Date().toISOString(),
    payment_method: 'mock',
    subscription_expires_at: expires.toISOString().slice(0, 10),
    preferred_destination: plan === 'medical' ? 'diagnostics' : 'media',
    activation_code_used: ref,
    parent_access_token: token('PRT'),
    child_interactive_token: token('CHD'),
    specialist_tutor_token: token('SPC'),
  };

  if (comprehensive !== 'completed') {
    fields.comprehensive_assessment_status = 'not_started';
  }

  const res = await fetch(
    `https://api.airtable.com/v0/${BASE}/${TABLE}/${encodeURIComponent(studentId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields, typecast: true }),
    }
  );

  const text = await res.text();
  if (!res.ok) throw new Error(text.slice(0, 400));
  return { alreadyActivated: false, airtable: JSON.parse(text), fields };
}

const env = loadEnvLocal();
const apiKey = env?.AIRTABLE_API_KEY || env?.VITE_AIRTABLE_PAT;

if (!apiKey) {
  console.error('❌ No AIRTABLE_API_KEY / VITE_AIRTABLE_PAT in .env.local');
  process.exit(1);
}

let studentId = process.argv[2]?.trim();
let row = studentId ? await airtableGet(apiKey, studentId) : null;

if (!row?.id) {
  console.log('🔍 Searching pending student…');
  row = await findPendingStudent(apiKey);
  studentId = row?.id;
}

if (!studentId) {
  console.error('❌ No student. Pass recXXX or create pending enrollment.');
  process.exit(1);
}

console.log('\n📋 BEFORE');
console.log('  id:', studentId);
console.log('  name:', row.fields?.student_name ?? '—');
console.log('  subscription_status:', row.fields?.subscription_status ?? '—');
console.log('  parent_access_token:', row.fields?.parent_access_token ? 'set' : 'empty');

const chargeId = buildMockChargeId();
console.log('\n⚡ Mock CAPTURED webhook simulation');
console.log('  chargeId:', chargeId);

const result = await activateMockPayment(apiKey, studentId, chargeId, 'tutor');
console.log('\n✅ Processor:', result.alreadyActivated ? 'idempotent skip' : 'PATCH ok');

const after = await airtableGet(apiKey, studentId);
const af = after?.fields ?? {};

console.log('\n📋 AFTER Airtable');
console.log('  subscription_status:', af.subscription_status);
console.log('  plan_code:', af.plan_code);
console.log('  payment_method:', af.payment_method);
console.log('  activation_code_used:', af.activation_code_used);
console.log('  parent_access_token:', af.parent_access_token);
console.log('  child_interactive_token:', af.child_interactive_token ? 'set' : 'empty');
console.log('  specialist_tutor_token:', af.specialist_tutor_token ? 'set' : 'empty');

const ok =
  af.subscription_status === 'active' &&
  af.parent_access_token?.startsWith('AUN-PRT-') &&
  af.child_interactive_token?.startsWith('AUN-CHD-') &&
  af.specialist_tutor_token?.startsWith('AUN-SPC-');

console.log(ok ? '\n🟢 MOCK WEBHOOK → AIRTABLE: PASSED' : '\n🔴 FAILED');
process.exit(ok ? 0 : 1);
