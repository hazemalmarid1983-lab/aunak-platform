/**
 * POST /api/payment/create-checkout
 * Tap hosted checkout OR mock checkout when MOCK mode (Preview, no TAP key).
 */

import { normalizePlanCode, PLAN_CODES } from '../../src/lib/plans.js';
import { planAmountForTap, DEFAULT_CHECKOUT_PLAN } from '../../src/lib/paymentPlans.js';
import {
  createTapCharge,
  isTapConfigured,
  sanitizeAscii,
  tapCheckoutUrl,
} from '../../src/lib/tapPayments.js';
import { fetchStudentRecord } from '../../src/lib/paymentActivation.js';
import {
  isMockPaymentsEnabled,
  buildMockChargeId,
} from '../../src/lib/mockPayments.js';

const ALLOWED_PLANS = new Set([
  PLAN_CODES.TUTOR,
  PLAN_CODES.MEDICAL,
  PLAN_CODES.ASSESSMENT_ONLY,
]);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const studentId = sanitizeAscii(req.body?.studentId);
  const plan = normalizePlanCode(req.body?.plan) || DEFAULT_CHECKOUT_PLAN;
  const flow = sanitizeAscii(req.body?.flow) || 'enrollment';
  const customer = req.body?.customer ?? {};

  if (!studentId) {
    res.status(400).json({ error: 'STUDENT_ID_REQUIRED' });
    return;
  }
  if (!ALLOWED_PLANS.has(plan)) {
    res.status(400).json({ error: 'PLAN_NOT_PAYABLE_ONLINE' });
    return;
  }

  const student = await fetchStudentRecord(studentId);
  if (!student?.id) {
    res.status(404).json({ error: 'STUDENT_NOT_FOUND' });
    return;
  }

  const { amount, currency } = planAmountForTap(plan);
  if (amount <= 0) {
    res.status(400).json({ error: 'INVALID_PLAN_AMOUNT' });
    return;
  }

  const host = sanitizeAscii(req.headers['x-forwarded-host'] || req.headers.host || 'aunak.vercel.app');
  const proto = sanitizeAscii(req.headers['x-forwarded-proto'] || 'https');
  const origin = `${proto}://${host}`;

  const redirectUrl =
    sanitizeAscii(req.body?.redirectUrl) ||
    `${origin}/payment/return?flow=${encodeURIComponent(flow)}&studentId=${encodeURIComponent(studentId)}&plan=${encodeURIComponent(plan)}`;

  /* ── Mock checkout (Preview / dev, no Tap key) ── */
  if (isMockPaymentsEnabled()) {
    const chargeId = buildMockChargeId();
    const params = new URLSearchParams({
      chargeId,
      studentId,
      plan,
      flow,
    });
    const checkoutUrl = `${origin}/api/payment/mock-complete?${params.toString()}`;

    res.status(200).json({
      ok: true,
      mock: true,
      chargeId,
      checkoutUrl,
      amount,
      currency,
      plan,
      message: 'Mock payment — simulates CAPTURED + webhook activation',
    });
    return;
  }

  if (!isTapConfigured()) {
    res.status(503).json({
      error: 'TAP_NOT_CONFIGURED',
      message: 'Set TAP_SECRET_KEY or enable Preview mock mode.',
      sandboxHint: true,
    });
    return;
  }

  const webhookUrl = `${origin}/api/payment/webhook`;
  const orderRef = `AUN-${studentId.slice(-8)}-${Date.now()}`;

  const studentName = sanitizeAscii(student.fields?.student_name || customer?.name || 'Student');
  const nameParts = studentName.split(/\s+/).filter(Boolean);
  const firstName = nameParts[0] || 'Parent';
  const lastName = nameParts.slice(1).join(' ') || 'Guardian';

  try {
    const charge = await createTapCharge({
      amount,
      currency,
      customer: {
        firstName,
        lastName,
        email: customer?.email,
        phoneCountryCode: customer?.phoneCountryCode || student.fields?.parent_country_code || '966',
        phoneNumber: customer?.phoneNumber || student.fields?.parent_phone || '500000000',
      },
      redirectUrl,
      webhookUrl,
      metadata: {
        student_id: studentId,
        plan_code: plan,
        flow,
        platform: 'aunak',
      },
      description: `Aunak · ${plan} · ${studentId}`,
      orderRef,
    });

    const checkoutUrl = tapCheckoutUrl(charge);
    if (!checkoutUrl) {
      res.status(502).json({ error: 'TAP_NO_CHECKOUT_URL', chargeId: charge?.id ?? null });
      return;
    }

    res.status(200).json({
      ok: true,
      chargeId: charge.id,
      checkoutUrl,
      amount,
      currency,
      plan,
    });
  } catch (err) {
    res.status(502).json({ error: err?.message ?? 'TAP_CHECKOUT_FAILED' });
  }
}
