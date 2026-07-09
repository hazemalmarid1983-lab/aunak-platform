import { PLAN_CODES, resolvePlanCode } from './plans';

const ACTIVATION_LS = 'aunak.activationCodes.v1';

const PLAN_PREFIX = {
  [PLAN_CODES.FREE]: 'FREE',
  [PLAN_CODES.TUTOR]: 'TUTOR',
  [PLAN_CODES.MEDICAL]: 'MEDICAL',
  [PLAN_CODES.INSTITUTION]: 'INST',
  [PLAN_CODES.ASSESSMENT_ONLY]: 'ASSESS',
};

function readStore() {
  try {
    const raw = localStorage.getItem(ACTIVATION_LS);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStore(list) {
  try {
    localStorage.setItem(ACTIVATION_LS, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

/** Generate code: AUN-{PLAN}-XXXX-YYYY */
export function generateActivationCode(plan = PLAN_CODES.TUTOR, year = new Date().getFullYear()) {
  const prefix = PLAN_PREFIX[plan] ?? 'TUTOR';
  const seg = Math.random().toString(36).replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase();
  return `AUN-${prefix}-${seg}-${year}`;
}

export function normalizeActivationCode(raw) {
  return String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

export function validateCodeFormat(code) {
  return /^AUN-(FREE|TUTOR|MEDICAL|INST|ASSESS)-[A-Z0-9]{4}-\d{4}$/.test(normalizeActivationCode(code));
}

export function planFromCodePrefix(code) {
  const c = normalizeActivationCode(code);
  const m = c.match(/^AUN-(FREE|TUTOR|MEDICAL|INST|ASSESS)-/);
  if (!m) return null;
  const map = {
    FREE: PLAN_CODES.FREE,
    TUTOR: PLAN_CODES.TUTOR,
    MEDICAL: PLAN_CODES.MEDICAL,
    INST: PLAN_CODES.INSTITUTION,
    ASSESS: PLAN_CODES.ASSESSMENT_ONLY,
  };
  return map[m[1]] ?? null;
}

/** Issue a code locally (admin / sovereign demo). */
export function issueActivationCode({ plan = PLAN_CODES.TUTOR, issuedBy = 'admin', studentId = null } = {}) {
  const code = generateActivationCode(plan);
  const entry = {
    code,
    plan: resolvePlanCode(plan) ?? plan,
    status: 'Unused',
    issuedAt: new Date().toISOString(),
    issuedBy,
    studentId,
    expiresAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  };
  const list = readStore();
  list.push(entry);
  writeStore(list);
  return entry;
}

export function findLocalActivationCode(code) {
  const c = normalizeActivationCode(code);
  return readStore().find((x) => normalizeActivationCode(x.code) === c && x.status === 'Unused');
}

export function markLocalCodeRedeemed(code, { studentId, parentPhone } = {}) {
  const c = normalizeActivationCode(code);
  const list = readStore();
  const idx = list.findIndex((x) => normalizeActivationCode(x.code) === c);
  if (idx < 0) return null;
  list[idx] = {
    ...list[idx],
    status: 'Redeemed',
    redeemedAt: new Date().toISOString(),
    redeemedStudentId: studentId ?? null,
    redeemedByPhone: parentPhone ?? null,
  };
  writeStore(list);
  return list[idx];
}
