/**
 * Shared CAPTURED charge → Airtable activation (Tap + Mock).
 */

import { sanitizeAscii, activateStudentAfterPayment } from './paymentActivation.js';
import { normalizePlanCode, PLAN_CODES } from './plans.js';
import { isMockChargeId } from './mockPayments.js';
import { buildTriplePortalLinks } from './tripleAccessProtocol.js';

export async function processCapturedPaymentCharge(charge, { origin } = {}) {
  const status = String(charge?.status ?? '').toUpperCase();
  if (status !== 'CAPTURED') {
    return { ok: true, ignored: true, status };
  }

  const studentId = sanitizeAscii(charge.metadata?.student_id || charge.metadata?.udf1);
  const plan = normalizePlanCode(charge.metadata?.plan_code || charge.metadata?.udf2) || PLAN_CODES.TUTOR;

  if (!studentId) {
    return { ok: true, warning: 'NO_STUDENT_IN_METADATA' };
  }

  const paymentMethod = isMockChargeId(charge.id) || charge.metadata?.mock ? 'mock' : 'tap';
  const result = await activateStudentAfterPayment({
    studentId,
    plan,
    chargeId: charge.id,
    paymentMethod,
    origin: origin ?? 'https://aunak.vercel.app',
  });

  return {
    ok: true,
    activated: result.active,
    alreadyActivated: result.alreadyActivated ?? false,
    studentId,
    plan: result.plan,
    paymentMethod,
    parentTokenIssued: Boolean(result.deviceTokens?.parent),
    deviceTokens: result.deviceTokens,
    portalLinks: result.portalLinks ?? buildTriplePortalLinks(origin, result.deviceTokens),
    mode: result.mode ?? null,
  };
}
