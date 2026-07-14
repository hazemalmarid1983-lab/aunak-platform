/**
 * Post-payment Airtable activation — shared by webhook, return verify, and manual redeem.
 * pending → active · triple tokens · idempotent on same charge reference.
 */

import { STUDENT as SF } from './airtableFields.js';
import { landingForPlan, PLAN_CODES, normalizePlanCode } from './plans.js';
import {
  generateTripleDeviceTokens,
  buildActivationRedeemFields,
  buildTriplePortalLinks,
} from './tripleAccessProtocol.js';
import { CENTRAL_BASE_ID, CENTRAL_TABLES } from './centralAirtable.js';

export function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

export function sanitizeAirtablePat(value) {
  let key = sanitizeAscii(value);
  if (
    (key.startsWith('"') && key.endsWith('"')) ||
    (key.startsWith("'") && key.endsWith("'"))
  ) {
    key = key.slice(1, -1).trim();
  }
  if (/^bearer\s+/i.test(key)) {
    key = key.replace(/^bearer\s+/i, '').trim();
  }
  return key;
}

export function airtableConfigFromEnv() {
  const apiKey =
    sanitizeAirtablePat(process.env.AIRTABLE_API_KEY) ||
    sanitizeAirtablePat(process.env.VITE_AIRTABLE_PAT) ||
    sanitizeAirtablePat(process.env.VITE_AIRTABLE_API_KEY) ||
    '';
  const baseId = sanitizeAscii(
    process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID || CENTRAL_BASE_ID
  ).split('/')[0];
  const studentsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) || CENTRAL_TABLES.students;
  return { apiKey, baseId, studentsTable };
}

export function subscriptionFieldsForPayment(plan, { paymentMethod = 'tap', chargeId } = {}) {
  const p = normalizePlanCode(plan) ?? PLAN_CODES.TUTOR;
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  const fields = {
    [SF.subscription_status]: 'active',
    [SF.plan_code]: p,
    [SF.last_payment_at]: new Date().toISOString(),
    [SF.payment_method]: paymentMethod,
    [SF.subscription_expires_at]: expires.toISOString().slice(0, 10),
    [SF.preferred_destination]: landingForPlan(p),
  };
  if (chargeId) {
    const prefix = paymentMethod === 'mock' ? 'MOCK' : 'TAP';
    fields[SF.activation_code_used] = `${prefix}-${sanitizeAscii(chargeId)}`;
  }
  return fields;
}

export async function fetchStudentRecord(studentId, config = airtableConfigFromEnv()) {
  const { apiKey, baseId, studentsTable } = config;
  if (!apiKey || !studentId) return null;

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${encodeURIComponent(studentId)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${sanitizeAirtablePat(apiKey)}`, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Skip re-activation if this exact charge was already processed. */
export function isAlreadyActivatedForCharge(existingFields, chargeId, paymentMethod = 'tap') {
  if (!existingFields || !chargeId) return false;
  const used = String(existingFields[SF.activation_code_used] ?? '').trim();
  const id = sanitizeAscii(chargeId);
  const primary = paymentMethod === 'mock' ? `MOCK-${id}` : `TAP-${id}`;
  if (used === primary) return true;
  return used === `TAP-${id}` || used === `MOCK-${id}`;
}

/**
 * Activate student after successful payment.
 * @returns {{ plan, landing, active, deviceTokens, alreadyActivated, airtable? }}
 */
export async function activateStudentAfterPayment({
  studentId,
  plan,
  chargeId,
  paymentMethod = 'tap',
  config = airtableConfigFromEnv(),
  origin = 'https://aunak.vercel.app',
}) {
  const planNorm = normalizePlanCode(plan) ?? PLAN_CODES.TUTOR;
  const { apiKey, baseId, studentsTable } = config;

  if (!studentId) throw new Error('STUDENT_ID_REQUIRED');

  const existing = await fetchStudentRecord(studentId, config);
  const existingFields = existing?.fields ?? null;

  if (chargeId && isAlreadyActivatedForCharge(existingFields, chargeId, paymentMethod)) {
    const tokens = {
      parent: existingFields?.[SF.parent_access_token] ?? null,
      child: existingFields?.[SF.child_interactive_token] ?? null,
      specialist: existingFields?.[SF.specialist_tutor_token] ?? null,
    };
    return {
      plan: planNorm,
      landing: landingForPlan(planNorm),
      subscriptionRaw: 'active',
      active: true,
      alreadyActivated: true,
      deviceTokens: tokens,
      portalLinks: buildTriplePortalLinks(origin, tokens),
    };
  }

  const deviceTokens = generateTripleDeviceTokens();
  const subscriptionFields = subscriptionFieldsForPayment(planNorm, { paymentMethod, chargeId });
  const comprehensiveStatus = existingFields?.[SF.comprehensive_assessment_status] ?? null;
  const fields = buildActivationRedeemFields(subscriptionFields, {
    tokens: deviceTokens,
    existingComprehensiveStatus: comprehensiveStatus,
  });

  if (!apiKey) {
    return {
      plan: planNorm,
      landing: landingForPlan(planNorm),
      subscriptionRaw: 'active',
      active: true,
      mode: 'client_fallback',
      deviceTokens,
      portalLinks: buildTriplePortalLinks(origin, deviceTokens),
      alreadyActivated: false,
    };
  }

  const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${encodeURIComponent(studentId)}`;
  const response = await fetch(recordUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${sanitizeAirtablePat(apiKey)}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields, typecast: true }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text.slice(0, 300) || 'AIRTABLE_PATCH_FAILED');
  }

  return {
    plan: planNorm,
    landing: landingForPlan(planNorm),
    subscriptionRaw: 'active',
    active: true,
    deviceTokens,
    portalLinks: buildTriplePortalLinks(origin, deviceTokens),
    alreadyActivated: false,
    airtable: JSON.parse(text),
  };
}
