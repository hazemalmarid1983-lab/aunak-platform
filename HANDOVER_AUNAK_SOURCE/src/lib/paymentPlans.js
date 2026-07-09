/**
 * Sovereign plan pricing — server is source of truth (never trust client amounts).
 * Tap Payments · SAR default · HyperPay-compatible metadata shape.
 */

import { PLAN_CODES, normalizePlanCode } from './plans.js';

/** Monthly subscription prices (SAR). Institution = manual / B2B. */
export const PLAN_PRICING = {
  [PLAN_CODES.TUTOR]: {
    amount: 299,
    currency: 'SAR',
    billingMonths: 1,
  },
  [PLAN_CODES.MEDICAL]: {
    amount: 499,
    currency: 'SAR',
    billingMonths: 1,
  },
  [PLAN_CODES.ASSESSMENT_ONLY]: {
    amount: 199,
    currency: 'SAR',
    billingMonths: 1,
  },
  [PLAN_CODES.FREE]: {
    amount: 0,
    currency: 'SAR',
    billingMonths: 1,
  },
};

export const DEFAULT_CHECKOUT_PLAN = PLAN_CODES.TUTOR;

export const CHECKOUT_PLAN_OPTIONS = [
  PLAN_CODES.TUTOR,
  PLAN_CODES.MEDICAL,
  PLAN_CODES.ASSESSMENT_ONLY,
];

export function getPlanPricing(planCode) {
  const plan = normalizePlanCode(planCode);
  return PLAN_PRICING[plan] ?? PLAN_PRICING[DEFAULT_CHECKOUT_PLAN];
}

/** ISO decimal places for Tap hashstring + charge amount. */
export function formatTapAmount(amount, currency = 'SAR') {
  const threeDecimal = ['BHD', 'KWD', 'OMR', 'JOD'];
  const decimals = threeDecimal.includes(String(currency).toUpperCase()) ? 3 : 2;
  return Number(amount).toFixed(decimals);
}

export function planAmountForTap(planCode) {
  const { amount, currency } = getPlanPricing(planCode);
  return {
    amount: Number(formatTapAmount(amount, currency)),
    currency,
  };
}
