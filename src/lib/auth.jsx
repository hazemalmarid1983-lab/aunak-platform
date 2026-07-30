/**
 * Aunak Authentication Layer — Gate logic for the sovereign platform.
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  fetchAirtableRecords,
  fetchStudents,
  findStudentByIdentifier,
  getField,
  MOCK_DATA_MODE,
  isMockAccessToken,
  normalizeMockAccessToken,
} from "./airtable";
import { AIRTABLE_TABLES } from "./airtableTables";
import { ACCESS as AF, STUDENT as SF } from "./airtableFields";
import { resolvePlanCode, PLAN_CODES } from "./plans";
import { newDynamicSessionId } from "./goalEngine";
import { buildSpecialistClinicalSession } from "./sovereignProtocol";

export const ROLES = {
  ADMIN: "admin",
  SPECIALIST: "specialist",
  PARENT: "parent",
  /** B2G overview / compliance dashboard (MINISTRY_OVERVIEW). */
  MINISTRY: "ministry_auditor",
  /** Clinical supervisor — lands on assessment protocol, not overview. */
  MINISTRY_SUPERVISOR: "ministry_supervisor",
};

/** Alias: ministry overview auditor role. */
export const MINISTRY_OVERVIEW = ROLES.MINISTRY;

export const SOVEREIGN_OWNER_EMAIL = 'hazem@aunak-center.com';

export function isSovereignOwner(user) {
  const email = String(user?.email ?? '').trim().toLowerCase();
  return email === SOVEREIGN_OWNER_EMAIL.toLowerCase();
}

export const SOVEREIGN_ONLY_SECTIONS = ['access', 'specialists'];

/** Admin (non-sovereign) clinical manager — specialist areas + resources. */
export const CLINICAL_MANAGER_SECTIONS = [
  'live', 'governance', 'assessmentProtocol', 'registry', 'diagnostics', 'behavior', 'classrooms',
  'scientific', 'learning', 'emotion', 'crisis', 'media', 'enrollment',
  'biometrics', 'community', 'research', 'reports', 'resources', 'summerAcademy', 'smartScheduler',
];

/** Clinical sections unlocked after sovereign biometric login (≥94.7%). */
export const BIOMETRIC_SOVEREIGN_SECTIONS = [
  'live', 'governance', 'assessmentProtocol', 'registry', 'diagnostics', 'behavior', 'classrooms',
  'scientific', 'learning', 'emotion', 'crisis', 'media', 'enrollment',
  'biometrics', 'community', 'research', 'reports', 'resources', 'summerAcademy', 'smartScheduler',
];

const ROLE_ACCESS = {
  [ROLES.ADMIN]: null,
  [ROLES.SPECIALIST]: [
    'live', 'governance', 'assessmentProtocol', 'clinicalAssessment', 'registry', 'diagnostics', 'behavior', 'classrooms',
    'scientific', 'learning', 'emotion', 'crisis', 'media', 'enrollment',
    'biometrics', 'community', 'research', 'reports', 'smartScheduler',
  ],
  [ROLES.PARENT]: ['reports', 'biometrics', 'governance'],
  [ROLES.MINISTRY]: ['ministry'],
  [ROLES.MINISTRY_SUPERVISOR]: [
    'assessmentProtocol',
    'clinicalAssessment',
    'diagnostics',
    'governance',
    'reports',
    'registry',
    'smartScheduler',
  ],
};

export function canAccessSection(user, role, sectionId) {
  if (SOVEREIGN_ONLY_SECTIONS.includes(sectionId) && !isSovereignOwner(user)) {
    // Mock demo: center admin token unlocks specialists + access control.
    if (
      MOCK_DATA_MODE &&
      normalizeMockAccessToken(user?.accessToken) === "MOCK-ADMIN"
    ) {
      /* allow */
    } else {
      return false;
    }
  }
  if (user?.biometricSovereign && BIOMETRIC_SOVEREIGN_SECTIONS.includes(sectionId)) {
    return true;
  }
  if (isSovereignOwner(user)) return true;
  if (role === ROLES.ADMIN) {
    return CLINICAL_MANAGER_SECTIONS.includes(sectionId);
  }
  const allowed = ROLE_ACCESS[role];
  return allowed == null || allowed.includes(sectionId);
}

/** True only for ministry overview / B2G auditor (not clinical supervisor). */
export function isMinistryAuditor(userOrRole) {
  const role =
    typeof userOrRole === 'string'
      ? userOrRole
      : userOrRole?.role ?? getSessionRole();
  if (role === ROLES.MINISTRY_SUPERVISOR) return false;
  return role === ROLES.MINISTRY || role === MINISTRY_OVERVIEW;
}

/** Clinical ministry supervisor → assessmentProtocol landing. */
export function isMinistrySupervisor(userOrRole) {
  const role =
    typeof userOrRole === 'string'
      ? userOrRole
      : userOrRole?.role ?? getSessionRole();
  return (
    role === ROLES.MINISTRY_SUPERVISOR ||
    String(role ?? '').toLowerCase() === 'ministry_supervisor'
  );
}

const SESSION_KEY = "aunak.session.v1";

const TOKEN_FIELDS = [AF.access_token];

const ADMIN_LEVELS = ["admin", "مدير", "super", "sovereign", "owner"];
const MINISTRY_SUPERVISOR_LEVELS = [
  "ministry_supervisor",
  "ministry supervisor",
  "مشرف وزارة",
  "مشرف الوزارة",
];
const MINISTRY_LEVELS = [
  "ministry_auditor",
  "ministry_overview",
  "ministry",
  "b2g",
  "وزارة",
  "مفتش",
  "inspector",
];

/** Clear gate session only (never invent a default user). Parent portal uses its own key. */
function clearStoredSessions() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
}

/**
 * In MOCK_DATA_MODE only sessions created via verifyAccessToken (MOCK-*) are restorable.
 * Parent / biometric leftovers must never auto-login.
 */
function isRestorableSession(session) {
  if (!session || typeof session !== "object") return false;
  if (!MOCK_DATA_MODE) return true;
  return isMockAccessToken(session.accessToken);
}

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!isRestorableSession(session)) {
      clearStoredSessions();
      return null;
    }
    return session;
  } catch {
    clearStoredSessions();
    return null;
  }
}

function writeSession(session) {
  try {
    if (!session) {
      clearStoredSessions();
      return;
    }
    if (!isRestorableSession(session)) {
      clearStoredSessions();
      return;
    }
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    /* sessionStorage unavailable */
  }
}

/** Boot hygiene: drop stale/invalid sessions so the app always opens on AunakGate when logged out. */
export function sanitizeAuthSessionOnBoot() {
  const session = readSession();
  if (!session) {
    clearStoredSessions();
    return null;
  }
  return session;
}

export function getSessionRole() {
  return readSession()?.role ?? null;
}

export function getSession() {
  return readSession();
}

export function getActiveStudentId() {
  return readSession()?.activeStudentId ?? null;
}

export function getSessionPlan() {
  return readSession()?.plan ?? PLAN_CODES.FREE;
}

function resolvePlanFromFields(fields) {
  const raw = getField(fields, SF.plan_code) || getField(fields, SF.subscription_status);
  return resolvePlanCode(raw);
}

function resolveRoleFromRecord(fields) {
  const level = String(getField(fields, AF.access_level) ?? "").toLowerCase();
  const permissions = String(getField(fields, AF.permissions) ?? "").toLowerCase();
  const blob = `${level} ${permissions}`;

  if (MINISTRY_SUPERVISOR_LEVELS.some((k) => blob.includes(String(k).toLowerCase()))) {
    return ROLES.MINISTRY_SUPERVISOR;
  }
  if (MINISTRY_LEVELS.some((k) => level.includes(k))) return ROLES.MINISTRY;
  if (ADMIN_LEVELS.some((k) => level.includes(k))) return ROLES.ADMIN;

  if (/advanced settings|الإعدادات المتقدمة/i.test(permissions)) return ROLES.ADMIN;

  return ROLES.SPECIALIST;
}

export async function verifyAccessToken(inputToken) {
  const token = String(inputToken ?? "").trim();
  if (!token) return null;

  // Mock demo: accept only the four Access Control codes (no email / no auto session).
  if (MOCK_DATA_MODE && !isMockAccessToken(token)) {
    return null;
  }

  const records = await fetchAirtableRecords(AIRTABLE_TABLES.accessControl);
  const normalizedInput = MOCK_DATA_MODE ? normalizeMockAccessToken(token) : token;

  for (const record of records) {
    const f = record?.fields ?? {};

    const tokenMatch = TOKEN_FIELDS.some((fieldName) => {
      const v = getField(f, fieldName);
      if (v == null) return false;
      const stored = String(v).trim();
      return MOCK_DATA_MODE
        ? normalizeMockAccessToken(stored) === normalizedInput
        : stored === token;
    });

    const email = getField(f, AF.user_email);
    const emailMatch =
      !MOCK_DATA_MODE &&
      email != null &&
      String(email).trim().toLowerCase() === token.toLowerCase();

    if (tokenMatch || emailMatch) {
      const role = resolveRoleFromRecord(f);
      const plan =
        resolvePlanFromFields(f) ??
        (role === ROLES.ADMIN ? PLAN_CODES.INSTITUTION : PLAN_CODES.INSTITUTION);
      const matchedToken = TOKEN_FIELDS.map((fieldName) => getField(f, fieldName)).find(
        (v) => v != null && String(v).trim() !== ""
      );
      const accessToken = MOCK_DATA_MODE
        ? normalizeMockAccessToken(matchedToken || token)
        : String(matchedToken || token).trim();
      const base = {
        role,
        plan,
        accessToken,
        isSovereignOwner: isSovereignOwner({ email: email || '' }),
        name:
          getField(f, AF.user_name) ||
          (role === ROLES.MINISTRY_SUPERVISOR
            ? 'مشرف الوزارة'
            : role === ROLES.MINISTRY
              ? 'مفتش الوزارة'
              : role === ROLES.ADMIN
                ? 'المدير الأعلى'
                : 'المعالج السلوكي'),
        email: email || '',
        permissions: getField(f, AF.permissions) || '',
        recordId: record.id,
        dynamicSessionId: newDynamicSessionId(),
        landingSection:
          role === ROLES.MINISTRY_SUPERVISOR
            ? 'assessmentProtocol'
            : role === ROLES.MINISTRY
              ? 'ministry'
              : 'registry',
        b2gAuditor: role === ROLES.MINISTRY,
      };
      if (MOCK_DATA_MODE && role !== ROLES.MINISTRY) {
        base.activeStudentId = "recMockStudent001";
      }
      if (role === ROLES.MINISTRY) {
        return base;
      }
      if (role === ROLES.MINISTRY_SUPERVISOR) {
        return buildSpecialistClinicalSession(base);
      }
      const session =
        role === ROLES.SPECIALIST || role === ROLES.ADMIN
          ? buildSpecialistClinicalSession(base)
          : base;
      return session;
    }
  }

  return null;
}

export function deriveChildCode(student) {
  const explicit = student?.studentCode;
  if (explicit && /AUN/i.test(String(explicit))) return String(explicit);
  if (explicit) return `AUN-${String(explicit).replace(/\s+/g, "").slice(0, 6)}-FX`;
  const seed = String(student?.id ?? "0000").replace(/[^a-zA-Z0-9]/g, "");
  const num = (seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 9000) + 1000;
  return `AUN-${num}-FX`;
}

export async function verifyBiometricChild(childIdentifier) {
  const students = await fetchStudents();
  const list = Array.isArray(students) ? students : [];
  const child = findStudentByIdentifier(list, childIdentifier);
  if (!child) return null;
  const subscriptionRaw = getField(child.fields, SF.subscription_status);
  const subscriptionExpiresAt = getField(child.fields, SF.subscription_expires_at) || null;
  const session = {
    role: ROLES.PARENT,
    plan: resolvePlanFromFields(child.fields) ?? PLAN_CODES.FREE,
    name: "ولي الأمر",
    childName: child.name || "الطفل",
    childCode: deriveChildCode(child),
    childId: child.id,
    activeStudentId: child.id,
    subscriptionRaw,
    subscriptionExpiresAt,
    subscriptionActivated: isSubscriptionActive(subscriptionRaw) && !isSubscriptionExpired({ subscriptionRaw, subscriptionExpiresAt }),
    landingSection: getField(child.fields, SF.preferred_destination) || null,
  };
  return session;
}

const SUBSCRIPTION_ACTIVE = ["active", "نشط", "مفعل", "فعال", "b2b_premium", "premium"];
const SUBSCRIPTION_PENDING = ["pending", "معلق", "بانتظار"];
const SUBSCRIPTION_EXPIRED = ["expired", "منته", "انته", "lapsed"];

export function isSubscriptionPending(rawStatus) {
  if (rawStatus == null || rawStatus === "") return false;
  const v = String(rawStatus).trim().toLowerCase();
  return SUBSCRIPTION_PENDING.some((k) => v.includes(k));
}

export function isSubscriptionActive(rawStatus) {
  if (rawStatus == null || rawStatus === "") return false;
  const v = String(rawStatus).trim().toLowerCase();
  if (SUBSCRIPTION_EXPIRED.some((k) => v.includes(k))) return false;
  return SUBSCRIPTION_ACTIVE.some((k) => v.includes(k));
}

export function isSubscriptionExpired(userOrStatus) {
  const raw =
    typeof userOrStatus === 'object' && userOrStatus !== null
      ? userOrStatus.subscriptionRaw
      : userOrStatus;
  const v = String(raw ?? '').trim().toLowerCase();
  if (SUBSCRIPTION_EXPIRED.some((k) => v.includes(k))) return true;
  const exp =
    typeof userOrStatus === 'object' && userOrStatus !== null
      ? userOrStatus.subscriptionExpiresAt
      : null;
  if (exp) {
    const t = new Date(exp).getTime();
    if (Number.isFinite(t) && t < Date.now()) return true;
  }
  return false;
}

export async function checkSubscriptionActive() {
  const students = await fetchStudents();
  return (Array.isArray(students) ? students : []).some((s) =>
    isSubscriptionActive(getField(s.fields, SF.subscription_status))
  );
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Never invent a user — only restore a validated token session (or null → AunakGate).
  const [user, setUser] = useState(() => sanitizeAuthSessionOnBoot());
  const [subscriptionActive, setSubscriptionActive] = useState(null);

  const login = useCallback((session) => {
    if (!session) {
      setUser(null);
      writeSession(null);
      setSubscriptionActive(null);
      return;
    }
    // Mock mode: only persist sessions minted by verifyAccessToken (accessToken = MOCK-*).
    if (MOCK_DATA_MODE && !isMockAccessToken(session.accessToken)) {
      console.warn("[auth:mock] Ignoring non-token login — use MOCK-* access codes only");
      return;
    }
    setUser(session);
    writeSession(session);
    if (session.tawasulMvp) setSubscriptionActive(true);
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    writeSession(null);
    setSubscriptionActive(null);
  }, []);

  const setActiveStudent = useCallback((studentId) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, activeStudentId: studentId ?? null };
      writeSession(next);
      return next;
    });
  }, []);

  const patchSession = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...(typeof patch === "function" ? patch(prev) : patch) };
      writeSession(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!user || user.tawasulMvp) {
      return undefined;
    }
    let cancelled = false;
    checkSubscriptionActive()
      .then((active) => {
        if (!cancelled) setSubscriptionActive(active);
      })
      .catch(() => {
        if (!cancelled) setSubscriptionActive(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, subscriptionActive, setActiveStudent, patchSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
