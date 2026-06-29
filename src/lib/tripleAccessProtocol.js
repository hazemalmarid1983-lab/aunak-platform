/**
 * Triple-device access protocol — one activation → three role tokens (parent / child / specialist).
 * Used on redeem (server + client fallback).
 */

import { STUDENT as SF } from './airtableFields.js';

export const DEVICE_TOKEN_PREFIX = {
  parent: 'PRT',
  child: 'CHD',
  specialist: 'SPC',
};

export const COMPREHENSIVE_ASSESSMENT = {
  not_started: 'not_started',
  in_progress: 'in_progress',
  completed: 'completed',
};

function randomHex(byteCount = 16) {
  const bytes = new Uint8Array(byteCount);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    throw new Error('crypto.getRandomValues unavailable');
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Generate one device token: AUN-{PRT|CHD|SPC}-{32hex} */
export function generateDeviceToken(role) {
  const prefix = DEVICE_TOKEN_PREFIX[role];
  if (!prefix) throw new Error(`Unknown device role: ${role}`);
  return `AUN-${prefix}-${randomHex(16).toUpperCase()}`;
}

/** Parent + child + specialist/tutor tokens for a student record. */
export function generateTripleDeviceTokens() {
  return {
    parent: generateDeviceToken('parent'),
    child: generateDeviceToken('child'),
    specialist: generateDeviceToken('specialist'),
  };
}

/** Map tokens → Airtable Students column writes. */
export function tripleTokenAirtableFields(tokens) {
  if (!tokens) return {};
  return {
    [SF.parent_access_token]: tokens.parent,
    [SF.child_interactive_token]: tokens.child,
    [SF.specialist_tutor_token]: tokens.specialist,
  };
}

/**
 * Fields applied on successful activation redeem (subscription + triple tokens).
 * Sets comprehensive_assessment_status to not_started unless already completed.
 */
export function buildActivationRedeemFields(
  subscriptionFields,
  { tokens, existingComprehensiveStatus } = {}
) {
  const triple = tripleTokenAirtableFields(tokens ?? generateTripleDeviceTokens());
  const fields = { ...subscriptionFields, ...triple };

  const existing = String(existingComprehensiveStatus ?? '')
    .trim()
    .toLowerCase();
  if (existing !== COMPREHENSIVE_ASSESSMENT.completed) {
    fields[SF.comprehensive_assessment_status] = COMPREHENSIVE_ASSESSMENT.not_started;
  }

  return fields;
}

/** Sovereign portal routes — parent / child / specialist after activation. */
export const TRIPLE_PORTAL_META = {
  parent: {
    path: '/parent',
    param: 'token',
    label: { ar: 'لوحة الأهل', en: 'Parent Dashboard' },
    emoji: '👨‍👩‍👧',
  },
  child: {
    path: '/child',
    param: 'token',
    label: { ar: 'عالم عوني — الطفل', en: 'Awni Play World' },
    emoji: '🌈',
  },
  specialist: {
    path: '/',
    param: 'token',
    section: 'specialists',
    label: { ar: 'البوابة السريرية', en: 'Clinical Portal' },
    emoji: '🩺',
  },
};

export function buildTriplePortalLinks(origin, tokens) {
  if (!tokens?.parent || !tokens?.child || !tokens?.specialist) return null;
  const base = String(origin ?? '').replace(/\/$/, '');
  const root = base || (typeof window !== 'undefined' ? window.location.origin : 'https://aunak.vercel.app');
  return {
    parent: `${root}/parent?token=${encodeURIComponent(tokens.parent)}`,
    child: `${root}/child?token=${encodeURIComponent(tokens.child)}`,
    specialist: `${root}/?section=specialists&token=${encodeURIComponent(tokens.specialist)}`,
    tokens,
  };
}
