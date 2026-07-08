/**
 * Aunak Authentication Layer — Gate logic for the sovereign platform.
 */

import { createContext, useContext, useState, useCallback, useEffect } from "react";
import { fetchAirtableRecords, fetchStudents, findStudentByIdentifier, getField } from "./airtable";
import { AIRTABLE_TABLES } from "./airtableTables";
import { ACCESS as AF, STUDENT as SF } from "./airtableFields";
import { resolvePlanCode, PLAN_CODES } from "./plans";
import { newDynamicSessionId } from "./goalEngine";
import { buildSpecialistClinicalSession } from "./sovereignProtocol";

export const ROLES = {
  ADMIN: "admin",
  SPECIALIST: "specialist",
  PARENT: "parent",
  MINISTRY: "ministry_auditor",
};

export const SOVEREIGN_OWNER_EMAIL = 'hazem@aunak-center.com';

export function isSovereignOwner(user) {
  const email = String(user?.email ?? '').trim().toLowerCase();
  return email === SOVEREIGN_OWNER_EMAIL.toLowerCase();
}

export const SOVEREIGN_ONLY_SECTIONS = ['access', 'specialists'];

/** Admin (non-sovereign) clinical manager — specialist areas + resources. */
export const CLINICAL_MANAGER_SECTIONS = [
  'live', 'registry', 'diagnostics', 'behavior', 'classrooms',
  'scientific', 'learning', 'emotion', 'crisis', 'media', 'enrollment',
  'biometrics', 'community', 'research', 'reports', 'resources', 'summerAcademy',
];

/** Clinical sections unlocked after sovereign biometric login (≥94.7%). */
export const BIOMETRIC_SOVEREIGN_SECTIONS = [
  'live', 'registry', 'diagnostics', 'behavior', 'classrooms',
  'scientific', 'learning', 'emotion', 'crisis', 'media', 'enrollment',
  'biometrics', 'community', 'research', 'reports', 'resources', 'summerAcademy',
];

const ROLE_ACCESS = {
  [ROLES.ADMIN]: null,
  [ROLES.SPECIALIST]: [
    'live', 'registry', 'diagnostics', 'behavior', 'classrooms',
    'scientific', 'learning', 'emotion', 'crisis', 'media', 'enrollment',
    'biometrics', 'community', 'research', 'reports',
  ],
  [ROLES.PARENT]: ['media', 'community', 'biometrics', 'resources', 'emotion', 'reports', 'summerAcademy'],
  [ROLES.MINISTRY]: ['ministry'],
};

export function canAccessSection(user, role, sectionId) {
  if (SOVEREIGN_ONLY_SECTIONS.includes(sectionId) && !isSovereignOwner(user)) {
    return false;
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

export function isMinistryAuditor(userOrRole) {
  const role =
    typeof userOrRole === 'string'
      ? userOrRole
      : userOrRole?.role ?? getSessionRole();
  return role === ROLES.MINISTRY || String(role ?? '').includes('ministry');
}

const SESSION_KEY = "aunak.session.v1";

const TOKEN_FIELDS = [AF.access_token];

const ADMIN_LEVELS = ["admin", "مدير", "super", "sovereign", "owner"];
const MINISTRY_LEVELS = ["ministry_auditor", "ministry", "b2g", "وزارة", "مفتش", "inspector"];

function readSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* sessionStorage unavailable */
  }
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
  if (MINISTRY_LEVELS.some((k) => level.includes(k))) return ROLES.MINISTRY;
  if (ADMIN_LEVELS.some((k) => level.includes(k))) return ROLES.ADMIN;

  const permissions = String(getField(fields, AF.permissions) ?? "");
  if (/advanced settings|الإعدادات المتقدمة/i.test(permissions)) return ROLES.ADMIN;

  return ROLES.SPECIALIST;
}

export async function verifyAccessToken(inputToken) {
  const token = String(inputToken ?? "").trim();
  if (!token) return null;

  const records = await fetchAirtableRecords(AIRTABLE_TABLES.accessControl);

  for (const record of records) {
    const f = record?.fields ?? {};

    const tokenMatch = TOKEN_FIELDS.some((fieldName) => {
      const v = getField(f, fieldName);
      return v != null && String(v).trim() === token;
    });

    const email = getField(f, AF.user_email);
    const emailMatch = email != null && String(email).trim().toLowerCase() === token.toLowerCase();

    if (tokenMatch || emailMatch) {
      const role = resolveRoleFromRecord(f);
      const plan =
        resolvePlanFromFields(f) ??
        (role === ROLES.ADMIN ? PLAN_CODES.INSTITUTION : PLAN_CODES.INSTITUTION);
      const base = {
        role,
        plan,
        isSovereignOwner: isSovereignOwner({ email: email || '' }),
        name:
          getField(f, AF.user_name) ||
          (role === ROLES.MINISTRY
            ? 'مفتش الوزارة'
            : role === ROLES.ADMIN
              ? 'المدير الأعلى'
              : 'أخصائي'),
        email: email || '',
        permissions: getField(f, AF.permissions) || '',
        recordId: record.id,
        dynamicSessionId: newDynamicSessionId(),
        landingSection: role === ROLES.MINISTRY ? 'ministry' : 'registry',
        b2gAuditor: role === ROLES.MINISTRY,
      };
      if (role === ROLES.MINISTRY) {
        return base;
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

const SUBSCRIPTION_ACTIVE = ["active", "نشط", "مفعل", "فعال"];
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
  const [user, setUser] = useState(() => readSession());
  const [subscriptionActive, setSubscriptionActive] = useState(null);

  const login = useCallback((session) => {
    setUser(session);
    writeSession(session);
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
      setSubscriptionActive(user?.tawasulMvp ? true : null);
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
