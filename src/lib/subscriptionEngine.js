import { getField, updateStudentRecord, STUDENT as SF } from './airtable';
import { isSubscriptionActive, isSubscriptionPending, isSubscriptionExpired } from './auth';
import { landingForPlan, PLAN_CODES, resolvePlanCode } from './plans';
import {
  findLocalActivationCode,
  markLocalCodeRedeemed,
  normalizeActivationCode,
  planFromCodePrefix,
  validateCodeFormat,
} from './activationCodes';
import {
  generateTripleDeviceTokens,
  buildActivationRedeemFields,
  buildTriplePortalLinks,
} from './tripleAccessProtocol';

export const SUBSCRIPTION_FIELD = SF.subscription_status;
export const PENDING_STATUS = 'pending';
export const ACTIVE_STATUS = 'active';

export function resolveSubscriptionGate(fields) {
  const raw = getField(fields, SF.subscription_status) ?? '';
  const v = String(raw).trim().toLowerCase();
  if (v === 'pending' || v === 'معلق' || v === 'بانتظار') {
    return { active: false, pending: true, reason: 'pending' };
  }
  const expires = getField(fields, SF.subscription_expires_at);
  if (expires) {
    const exp = new Date(expires).getTime();
    if (Number.isFinite(exp) && exp < Date.now()) {
      return { active: false, pending: false, reason: 'expired' };
    }
  }
  return {
    active: isSubscriptionActive(raw),
    pending: false,
    reason: raw || 'none',
  };
}

export function subscriptionFieldsForPending() {
  return {
    [SF.subscription_status]: PENDING_STATUS,
  };
}

export function subscriptionFieldsForActivation(plan, { landing } = {}) {
  const p = resolvePlanCode(plan) ?? plan ?? PLAN_CODES.TUTOR;
  const fields = {
    [SF.subscription_status]: ACTIVE_STATUS,
    [SF.plan_code]: p,
    [SF.last_payment_at]: new Date().toISOString(),
    [SF.payment_method]: 'manual_code',
  };
  const land = landing ?? landingForPlan(p);
  if (land) fields[SF.preferred_destination] = land;
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  fields[SF.subscription_expires_at] = expires.toISOString().slice(0, 10);
  return fields;
}

/** Redeem activation code — local store + Airtable PATCH. */
export async function redeemActivationCode({ code, studentId, parentPhone }) {
  const normalized = normalizeActivationCode(code);
  if (!validateCodeFormat(normalized)) {
    throw new Error('INVALID_CODE_FORMAT');
  }

  let plan = planFromCodePrefix(normalized);
  const local = findLocalActivationCode(normalized);
  if (local?.plan) plan = resolvePlanCode(local.plan) ?? local.plan;
  if (!plan) throw new Error('UNKNOWN_PLAN');

  if (local) {
    markLocalCodeRedeemed(normalized, { studentId, parentPhone });
  }

  if (!studentId) throw new Error('STUDENT_ID_REQUIRED');

  const deviceTokens = generateTripleDeviceTokens();
  const subscriptionFields = subscriptionFieldsForActivation(plan);
  subscriptionFields[SF.activation_code_used] = normalized;
  const fields = buildActivationRedeemFields(subscriptionFields, { tokens: deviceTokens });
  await updateStudentRecord(studentId, fields);

  return {
    plan,
    landing: landingForPlan(plan),
    subscriptionRaw: ACTIVE_STATUS,
    active: true,
    deviceTokens,
    portalLinks: buildTriplePortalLinks(
      typeof window !== 'undefined' ? window.location.origin : 'https://aunak.vercel.app',
      deviceTokens
    ),
  };
}

/** Whether parent session must pass the activation gate (Value Lock). */
export function needsActivationGate(user) {
  if (!user || user.role !== 'parent' || !user.childId) return false;
  if (user.subscriptionActivated) return false;
  if (isSubscriptionActive(user.subscriptionRaw) && !isSubscriptionExpired(user)) return false;
  return (
    isSubscriptionPending(user.subscriptionRaw) ||
    user.subscriptionRaw == null ||
    user.subscriptionRaw === '' ||
    isSubscriptionExpired(user)
  );
}

export function activationGateReason(user) {
  if (isSubscriptionExpired(user)) return 'expired';
  return 'pending';
}

/** Try server redeem first, fall back to client. */
export async function redeemActivationCodeWithApi({ code, studentId, parentPhone }) {
  try {
    const res = await fetch('/api/activation/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ code, studentId, parentPhone }),
    });
    if (res.ok) return res.json();
  } catch {
    /* fall through */
  }
  return redeemActivationCode({ code, studentId, parentPhone });
}
