/**
 * GET /api/payment/mock-complete
 * Simulates successful Tap checkout: fires webhook logic → redirects to /payment/return.
 */

import { sanitizeAscii } from '../../src/lib/tapPayments.js';
import {
  isMockPaymentsEnabled,
  buildMockCharge,
  buildMockChargeId,
  MOCK_WEBHOOK_HEADER,
} from '../../src/lib/mockPayments.js';
import { processCapturedPaymentCharge } from '../../src/lib/paymentWebhookProcessor.js';
import { normalizePlanCode, PLAN_CODES } from '../../src/lib/plans.js';
import { planAmountForTap } from '../../src/lib/paymentPlans.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isMockPaymentsEnabled()) {
    res.status(403).json({ error: 'MOCK_PAYMENTS_DISABLED' });
    return;
  }

  const studentId = sanitizeAscii(req.query?.studentId);
  const plan = normalizePlanCode(req.query?.plan) || PLAN_CODES.TUTOR;
  const flow = sanitizeAscii(req.query?.flow) || 'enrollment';
  const chargeId = sanitizeAscii(req.query?.chargeId) || buildMockChargeId();

  if (!studentId) {
    res.status(400).json({ error: 'STUDENT_ID_REQUIRED' });
    return;
  }

  const { amount, currency } = planAmountForTap(plan);
  const charge = buildMockCharge({ chargeId, studentId, plan, amount, currency, flow });

  const host = sanitizeAscii(req.headers['x-forwarded-host'] || req.headers.host || 'localhost');
  const proto = sanitizeAscii(req.headers['x-forwarded-proto'] || 'https');

  try {
    await processCapturedPaymentCharge(charge, {
      origin: `${proto}://${host}`,
    });

    const returnUrl = new URL('/payment/return', `${proto}://${host}`);
    returnUrl.searchParams.set('flow', flow);
    returnUrl.searchParams.set('studentId', studentId);
    returnUrl.searchParams.set('plan', plan);
    returnUrl.searchParams.set('chargeId', chargeId);
    returnUrl.searchParams.set('mock', '1');

    res.redirect(302, returnUrl.toString());
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'MOCK_COMPLETE_FAILED' });
  }
}

/**
 * POST /api/payment/mock-fire — direct webhook simulation (QA / automation).
 * Body: { studentId, plan?, flow? }
 * Header: x-aunak-mock-payment: sovereign-preview
 */
export async function mockFireHandler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!isMockPaymentsEnabled()) {
    res.status(403).json({ error: 'MOCK_PAYMENTS_DISABLED' });
    return;
  }

  const studentId = sanitizeAscii(req.body?.studentId);
  const plan = normalizePlanCode(req.body?.plan) || PLAN_CODES.TUTOR;
  const flow = sanitizeAscii(req.body?.flow) || 'test';

  if (!studentId) {
    res.status(400).json({ error: 'STUDENT_ID_REQUIRED' });
    return;
  }

  const chargeId = buildMockChargeId();
  const { amount, currency } = planAmountForTap(plan);
  const charge = buildMockCharge({ chargeId, studentId, plan, amount, currency, flow });

  try {
    const result = await processCapturedPaymentCharge(charge);
    res.status(200).json({ ...result, chargeId, mock: true });
  } catch (err) {
    res.status(500).json({ error: err?.message ?? 'MOCK_FIRE_FAILED' });
  }
}
