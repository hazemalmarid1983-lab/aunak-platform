/**
 * GET /api/payment/verify-return
 */

import {
  fetchTapCharge,
  isTapChargeCaptured,
  isTapConfigured,
  sanitizeAscii,
} from '../../../src/lib/tapPayments.js';
import { isMockPaymentsEnabled, isMockChargeId, buildMockCharge } from '../../../src/lib/mockPayments.js';
import { processCapturedPaymentCharge } from '../../../src/lib/paymentWebhookProcessor.js';
import { normalizePlanCode, PLAN_CODES } from '../../../src/lib/plans.js';
import { planAmountForTap } from '../../../src/lib/paymentPlans.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const chargeId = sanitizeAscii(req.query?.chargeId || req.query?.tap_id);
  const studentId = sanitizeAscii(req.query?.studentId);
  const plan = normalizePlanCode(req.query?.plan) || PLAN_CODES.TUTOR;
  const flow = sanitizeAscii(req.query?.flow) || 'enrollment';

  if (!chargeId) {
    res.status(400).json({ error: 'CHARGE_ID_REQUIRED' });
    return;
  }

  if (!studentId) {
    res.status(400).json({ error: 'STUDENT_ID_REQUIRED' });
    return;
  }

  try {
    let charge;

    if (isMockChargeId(chargeId)) {
      if (!isMockPaymentsEnabled()) {
        res.status(403).json({ error: 'MOCK_PAYMENTS_DISABLED' });
        return;
      }
      const { amount, currency } = planAmountForTap(plan);
      charge = buildMockCharge({ chargeId, studentId, plan, amount, currency, flow });
    } else {
      if (!isTapConfigured()) {
        res.status(503).json({ error: 'TAP_NOT_CONFIGURED' });
        return;
      }
      charge = await fetchTapCharge(chargeId);
      const metaStudent = sanitizeAscii(charge.metadata?.student_id);
      if (metaStudent && metaStudent !== studentId) {
        res.status(403).json({ error: 'STUDENT_MISMATCH' });
        return;
      }
      if (!isTapChargeCaptured(charge)) {
        res.status(402).json({ error: 'PAYMENT_NOT_CAPTURED', status: charge.status });
        return;
      }
    }

    const host = sanitizeAscii(req.headers['x-forwarded-host'] || req.headers.host || 'aunak.vercel.app');
    const proto = sanitizeAscii(req.headers['x-forwarded-proto'] || 'https');
    const origin = `${proto}://${host}`;
    const result = await processCapturedPaymentCharge(charge, { origin });

    res.status(200).json({
      ...result,
      flow,
      chargeId: charge.id,
      parentAccessToken: result.deviceTokens?.parent ?? null,
    });
  } catch (err) {
    res.status(502).json({ error: err?.message ?? 'VERIFY_FAILED' });
  }
}
