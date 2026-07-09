/**
 * POST /api/payment/mock-fire
 */

import { sanitizeAscii } from '../../../src/lib/tapPayments.js';
import {
  isMockPaymentsEnabled,
  buildMockCharge,
  buildMockChargeId,
} from '../../../src/lib/mockPayments.js';
import { processCapturedPaymentCharge } from '../../../src/lib/paymentWebhookProcessor.js';
import { normalizePlanCode, PLAN_CODES } from '../../../src/lib/plans.js';
import { planAmountForTap } from '../../../src/lib/paymentPlans.js';

export default async function handler(req, res) {
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
