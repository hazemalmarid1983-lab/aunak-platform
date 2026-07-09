/**
 * Sovereign mock payment layer — Preview / dev only when Tap key absent.
 * Simulates CAPTURED charges + webhook path without sk_test_.
 */

import { isTapConfigured } from './tapPayments.js';
import { planAmountForTap } from './paymentPlans.js';
import { normalizePlanCode, PLAN_CODES } from './plans.js';

export const MOCK_CHARGE_PREFIX = 'chg_MOCK_';
export const MOCK_WEBHOOK_HEADER = 'x-aunak-mock-payment';

export function isMockPaymentsEnabled() {
  if (process.env.MOCK_PAYMENTS === 'false') return false;
  if (process.env.MOCK_PAYMENTS === 'true') return true;
  if (process.env.VERCEL_ENV === 'production') return false;
  if (isTapConfigured()) return false;
  return (
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_ENV === 'development' ||
    process.env.NODE_ENV === 'development'
  );
}

export function isMockChargeId(chargeId) {
  return String(chargeId ?? '').startsWith(MOCK_CHARGE_PREFIX);
}

export function buildMockChargeId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${MOCK_CHARGE_PREFIX}${ts}_${rand}`;
}

/** Tap-shaped charge payload for webhook + verify-return. */
export function buildMockCharge({ chargeId, studentId, plan, amount, currency, flow = 'enrollment' }) {
  const id = chargeId || buildMockChargeId();
  const planNorm = normalizePlanCode(plan) || PLAN_CODES.TUTOR;
  const pricing = amount != null ? { amount, currency } : planAmountForTap(planNorm);

  return {
    id,
    object: 'charge',
    live_mode: false,
    status: 'CAPTURED',
    amount: pricing.amount,
    currency: pricing.currency,
    metadata: {
      student_id: studentId,
      plan_code: planNorm,
      flow,
      platform: 'aunak',
      mock: true,
    },
    reference: {
      gateway: 'MOCK_GATEWAY',
      payment: `MOCK_PAY_${Date.now()}`,
    },
    transaction: {
      created: String(Date.now()),
    },
  };
}

export function verifyMockWebhookRequest(charge, headers = {}) {
  if (!isMockPaymentsEnabled() || !isMockChargeId(charge?.id)) return false;
  const header = headers[MOCK_WEBHOOK_HEADER] || headers[MOCK_WEBHOOK_HEADER.toLowerCase()];
  return header === 'sovereign-preview' || Boolean(charge?.metadata?.mock);
}

export function activationReferenceForCharge(chargeId, paymentMethod = 'tap') {
  const id = String(chargeId ?? '').replace(/[^\x20-\x7E]/g, '').trim();
  const prefix = paymentMethod === 'mock' ? 'MOCK' : 'TAP';
  return `${prefix}-${id}`;
}
