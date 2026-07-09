/**
 * Tap Payments — server-side charge creation + webhook hashstring verification.
 * Docs: https://developers.tap.company/docs/webhook
 */

import { formatTapAmount } from './paymentPlans.js';

const TAP_API_BASE = 'https://api.tap.company/v2';

export function getTapSecretKey() {
  return process.env.TAP_SECRET_KEY || process.env.TAP_SECRET || '';
}

export function isTapConfigured() {
  return Boolean(getTapSecretKey());
}

export function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

/** Build hashstring payload per Tap charge/authorize spec. */
export function buildTapHashString(charge) {
  const id = charge?.id ?? '';
  const amount = formatTapAmount(charge?.amount ?? 0, charge?.currency ?? 'SAR');
  const currency = charge?.currency ?? '';
  const gatewayRef = charge?.reference?.gateway ?? '';
  const paymentRef = charge?.reference?.payment ?? '';
  const status = charge?.status ?? '';
  const created = charge?.transaction?.created ?? charge?.created ?? '';
  return `x_id${id}x_amount${amount}x_currency${currency}x_gateway_reference${gatewayRef}x_payment_reference${paymentRef}x_status${status}x_created${created}`;
}

/** Verify Tap webhook `hashstring` header (HMAC-SHA256 with secret key). */
export async function verifyTapWebhookHash(charge, hashstringHeader) {
  const secret = getTapSecretKey();
  if (!secret || !hashstringHeader) return false;

  const payload = buildTapHashString(charge);
  const crypto = await import('crypto');
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return expected === String(hashstringHeader).trim();
}

/** Create a hosted checkout charge — returns Tap charge object. */
export async function createTapCharge({
  amount,
  currency,
  customer,
  redirectUrl,
  webhookUrl,
  metadata,
  description,
  orderRef,
}) {
  const secret = getTapSecretKey();
  if (!secret) throw new Error('TAP_NOT_CONFIGURED');

  const body = {
    amount: Number(formatTapAmount(amount, currency)),
    currency: String(currency).toUpperCase(),
    customer: {
      first_name: sanitizeAscii(customer?.firstName || customer?.name || 'Parent'),
      last_name: sanitizeAscii(customer?.lastName || 'Aunak'),
      email: sanitizeAscii(customer?.email || 'parent@aunak.app'),
      phone: {
        country_code: sanitizeAscii(customer?.phoneCountryCode || '966'),
        number: sanitizeAscii(customer?.phoneNumber || '500000000'),
      },
    },
    source: { id: 'src_all' },
    redirect: { url: redirectUrl },
    post: { url: webhookUrl },
    metadata: metadata ?? {},
    description: sanitizeAscii(description || 'Aunak subscription'),
    reference: { order: sanitizeAscii(orderRef || `AUN-${Date.now()}`) },
    receipt: { email: false, sms: false },
  };

  const res = await fetch(`${TAP_API_BASE}/charges`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`TAP_CHARGE_PARSE_ERROR: ${text.slice(0, 200)}`);
  }

  if (!res.ok) {
    const msg = data?.errors?.[0]?.description || data?.message || text.slice(0, 200);
    throw new Error(`TAP_CHARGE_FAILED: ${msg}`);
  }

  return data;
}

/** Fetch charge by ID (return-url verification). */
export async function fetchTapCharge(chargeId) {
  const secret = getTapSecretKey();
  if (!secret) throw new Error('TAP_NOT_CONFIGURED');

  const id = sanitizeAscii(chargeId);
  const res = await fetch(`${TAP_API_BASE}/charges/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${secret}`,
      Accept: 'application/json',
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('TAP_FETCH_PARSE_ERROR');
  }

  if (!res.ok) {
    throw new Error(data?.message || 'TAP_FETCH_FAILED');
  }

  return data;
}

export function tapCheckoutUrl(charge) {
  return charge?.transaction?.url || charge?.redirect?.url || null;
}

export function isTapChargeCaptured(charge) {
  return String(charge?.status ?? '').toUpperCase() === 'CAPTURED';
}
