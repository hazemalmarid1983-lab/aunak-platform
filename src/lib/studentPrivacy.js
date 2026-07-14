/**
 * Privacy helpers for masking student identifiers in the UI.
 */

import { isStealthMode, setStealthMode } from './sovereignAudio';
import { getSessionRole, ROLES } from './auth';

const FINANCIAL_FIELD_PATTERN =
  /كفاءة التشغيل|صافي|إيراد|الدفع|دفع|فاتورة|مالي|سعر|تكلفة|revenue|payment|invoice|price|cost|billing|paid|operating efficiency|net revenue/i;

const CLINICAL_FIELD_PATTERN =
  /هدف إجرائي|الهدف الإجرائي|مؤشر التحسن|تشخيص|تقرير طبي|سجل طبي|clinical|diagnosis|medical|iep goal|improvement index/i;

export const STEALTH_BYPASS_CODE = '141092245';
export const SOVEREIGN_EMERGENCY_CODE = '947141092';
export const STEALTH_HIDDEN_SECTIONS = [
  'access',
  'specialists',
  'registry',
  'research',
  'enrollment',
  'diagnostics',
  'scientific',
];

const STEALTH_EVENT = 'aunak-stealth-change';
const EMERGENCY_EVENT = 'aunak-emergency-login';
let stealthDigitBuffer = '';
let emergencyDigitBuffer = '';

export function isAppStealthActive() {
  return isStealthMode();
}

export function setAppStealthActive(on) {
  setStealthMode(Boolean(on));
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STEALTH_EVENT, { detail: { active: Boolean(on) } }));
  }
}

export function toggleAppStealth() {
  setAppStealthActive(!isAppStealthActive());
}

export function isSectionHiddenInStealth(sectionId) {
  return isAppStealthActive() && STEALTH_HIDDEN_SECTIONS.includes(sectionId);
}

export function shouldForceStudentNameMask(revealNames) {
  if (getSessionRole() === ROLES.MINISTRY) return true;
  return isAppStealthActive() || !revealNames;
}

export function subscribeStealthChanges(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = (e) => callback(e?.detail?.active ?? isAppStealthActive());
  window.addEventListener(STEALTH_EVENT, handler);
  return () => window.removeEventListener(STEALTH_EVENT, handler);
}

export function handleStealthKeyInput(key) {
  if (!/^\d$/.test(String(key))) {
    stealthDigitBuffer = '';
    return false;
  }
  stealthDigitBuffer = (stealthDigitBuffer + String(key)).slice(-STEALTH_BYPASS_CODE.length);
  if (stealthDigitBuffer === STEALTH_BYPASS_CODE) {
    stealthDigitBuffer = '';
    toggleAppStealth();
    return true;
  }
  return false;
}

/** Sovereign emergency field-inspection login — hidden digit code (94.7 protocol). */
export function handleEmergencyKeyInput(key) {
  if (!/^\d$/.test(String(key))) {
    emergencyDigitBuffer = '';
    return false;
  }
  emergencyDigitBuffer = (emergencyDigitBuffer + String(key)).slice(-SOVEREIGN_EMERGENCY_CODE.length);
  if (emergencyDigitBuffer === SOVEREIGN_EMERGENCY_CODE) {
    emergencyDigitBuffer = '';
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EMERGENCY_EVENT));
    }
    return true;
  }
  return false;
}

export function subscribeEmergencyLogin(callback) {
  if (typeof window === 'undefined') return () => {};
  const handler = () => callback();
  window.addEventListener(EMERGENCY_EVENT, handler);
  return () => window.removeEventListener(EMERGENCY_EVENT, handler);
}

export function handleSovereignKeyInput(key) {
  return handleStealthKeyInput(key) || handleEmergencyKeyInput(key);
}

export function maskSensitiveFields(fields, role) {
  if (!fields || typeof fields !== 'object') return fields;
  if (role === 'admin' && !isAppStealthActive()) return fields;
  const masked = {};
  for (const [key, value] of Object.entries(fields)) {
    const isSensitive =
      FINANCIAL_FIELD_PATTERN.test(key) || CLINICAL_FIELD_PATTERN.test(key);
    if (!isSensitive) masked[key] = value;
  }
  return masked;
}

export function maskFinancialFields(fields, role) {
  return maskSensitiveFields(fields, role);
}

export function getMaskedStudentLabel(index, lang = 'ar') {
  const num = String(index + 1).padStart(2, '0');
  return lang === 'ar' ? `مستفيد-${num}` : `Beneficiary-${num}`;
}

export function getStudentInitials(name) {
  if (!name?.trim()) return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getDisplayStudentName(student, index, revealNames, lang, noNameLabel) {
  if (shouldForceStudentNameMask(revealNames)) {
    return getMaskedStudentLabel(index, lang);
  }
  return student.name || noNameLabel;
}

export function getDisplayStudentCode(student, revealNames) {
  if (shouldForceStudentNameMask(revealNames)) {
    return null;
  }
  if (revealNames && student.studentCode) {
    return student.studentCode;
  }
  return null;
}
