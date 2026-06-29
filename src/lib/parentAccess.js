import { fetchStudents, getField } from './airtable';
import { STUDENT as SF } from './airtableFields';
import { isSubscriptionActive } from './auth';
import {
  activateMasterBypass,
  isMasterBypassActive,
  validateMasterKey,
} from './sovereignMasterBypass';

const PARENT_SESSION_KEY = 'aunak.parentSession.v1';

function normalizeToken(raw) {
  return String(raw ?? '').trim().toUpperCase();
}

/** Resolve student by parent_access_token (AUN-PRT-...). */
export async function findStudentByParentToken(token) {
  const key = normalizeToken(token);
  if (!key || !key.startsWith('AUN-PRT-')) return null;

  const students = await fetchStudents();
  return (
    students.find((s) => normalizeToken(s.parentAccessToken) === key) ||
    students.find((s) => normalizeToken(getField(s.fields, SF.parent_access_token)) === key) ||
    null
  );
}

export function parseParentRouteToken() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('token')?.trim() || null;
}

/** Read ?master= or ?sovereign_master= from URL (before/after bootstrap strip). */
export function parseMasterQueryParam() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('master') ?? params.get('sovereign_master');
}

/** Sovereign QA — auto-pass parent biometric when master key is valid. */
export function tryParentMasterBypass({ token, studentId }) {
  if (!token || !studentId) return false;

  const fromUrl = parseMasterQueryParam();
  if (fromUrl && validateMasterKey(fromUrl)) {
    activateMasterBypass(fromUrl);
  }

  if (!isMasterBypassActive()) return false;

  writeParentSession({
    token,
    studentId,
    verified: true,
    verifiedAt: new Date().toISOString(),
    similarityPercent: 100,
    masterBypass: true,
  });
  return true;
}

export function shouldAutoBypassParentBiometric() {
  return isMasterBypassActive();
}

export function readParentSession() {
  try {
    const raw = sessionStorage.getItem(PARENT_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeParentSession(session) {
  try {
    if (session) sessionStorage.setItem(PARENT_SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(PARENT_SESSION_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

export function clearParentSession() {
  writeParentSession(null);
}

/** True when biometric gate passed for this token + student. */
export function isParentSessionVerified(token, studentId) {
  const stored = readParentSession();
  if (!stored?.verified) return false;
  if (normalizeToken(stored.token) !== normalizeToken(token)) return false;
  if (stored.studentId !== studentId) return false;
  return true;
}

export function assertParentSubscription(student) {
  const raw = getField(student?.fields, SF.subscription_status);
  return isSubscriptionActive(raw);
}
