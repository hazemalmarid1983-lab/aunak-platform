/**
 * Client-side payment checkout — initiates Tap hosted page (no secrets on client).
 */

import { DEFAULT_CHECKOUT_PLAN } from './paymentPlans';

const PENDING_KEY = 'aunak_payment_pending';
const COMPLETE_KEY = 'aunak_payment_complete';
const ENROLLMENT_DRAFT_KEY = 'aunak_enrollment_draft';

export function saveEnrollmentDraft(draft) {
  try {
    sessionStorage.setItem(ENROLLMENT_DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function readEnrollmentDraft() {
  try {
    const raw = sessionStorage.getItem(ENROLLMENT_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearEnrollmentDraft() {
  try {
    sessionStorage.removeItem(ENROLLMENT_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function savePaymentPending(payload) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...payload, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function readPaymentPending() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPaymentPending() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function savePaymentComplete(payload) {
  try {
    sessionStorage.setItem(COMPLETE_KEY, JSON.stringify({ ...payload, completedAt: Date.now() }));
    clearPaymentPending();
  } catch {
    /* ignore */
  }
}

export function readPaymentComplete() {
  try {
    const raw = sessionStorage.getItem(COMPLETE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPaymentComplete() {
  try {
    sessionStorage.removeItem(COMPLETE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Create Tap checkout session and redirect browser to hosted payment page.
 */
export async function startTapCheckout({
  studentId,
  plan = DEFAULT_CHECKOUT_PLAN,
  flow = 'enrollment',
  customer,
}) {
  if (!studentId) throw new Error('STUDENT_ID_REQUIRED');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUrl = `${origin}/payment/return?flow=${encodeURIComponent(flow)}&studentId=${encodeURIComponent(studentId)}&plan=${encodeURIComponent(plan)}`;

  const res = await fetch('/api/payment/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ studentId, plan, flow, customer, redirectUrl }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || 'CHECKOUT_FAILED');
  }

  savePaymentPending({
    studentId,
    plan,
    flow,
    chargeId: data.chargeId,
    checkoutUrl: data.checkoutUrl,
  });

  if (flow === 'enrollment' && typeof window !== 'undefined') {
    const draft = readEnrollmentDraft();
    if (draft) saveEnrollmentDraft({ ...draft, recordId: studentId, plan });
  }

  if (!data.checkoutUrl) throw new Error('NO_CHECKOUT_URL');
  window.location.assign(data.checkoutUrl);
  return data;
}

/** Verify payment after Tap redirect (webhook may have already activated). */
export async function verifyPaymentReturn({ chargeId, studentId, plan, flow }) {
  const params = new URLSearchParams();
  if (chargeId) params.set('chargeId', chargeId);
  if (studentId) params.set('studentId', studentId);
  if (plan) params.set('plan', plan);
  if (flow) params.set('flow', flow);

  const res = await fetch(`/api/payment/verify-return?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'VERIFY_FAILED');
  return data;
}
