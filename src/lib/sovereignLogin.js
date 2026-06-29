/**
 * Sovereign biometric login — post-match activation (harmony, gaze, session registry).
 */

import {
  parseHarmonyScore,
  updateStudentRecord,
  getField,
} from "./airtable";
import { STUDENT as SF } from "./airtableFields";
import { deriveChildCode, ROLES } from "./auth";
import {
  PLAN_CODES,
  resolveEnrollmentAccess,
  resolvePlanFromStudentFields,
} from "./plans";
import { newDynamicSessionId } from "./goalEngine";
import {
  computeHarmonyAfterBiometricLogin,
  syncHarmonyToAirtable,
  HARMONY_LOGIN_DEDUCTION_RATE,
} from "./harmonyEngine";

export { HARMONY_LOGIN_DEDUCTION_RATE };
export { resolveEnrollmentAccess } from "./plans";
export const GAZE_NEUTRALITY_HOLD_MS = 5000;
export const SESSION_FIELD_COUNT = 66;

const AL_HUSSEIN_PATTERNS = [/الحسين/i, /al[\s-]?hussein/i, /hussein/i];

export function isAlHusseinStudent(student) {
  const name = String(student?.name ?? "").trim();
  if (!name) return false;
  const normalized = name.toLowerCase().replace(/\s+/g, " ");
  return AL_HUSSEIN_PATTERNS.some((re) => re.test(name) || re.test(normalized));
}

/** Apply 20% harmony deduction after sovereign biometric match. */
export function computeHarmonyAfterLoginDeduction(baseScore, rate = HARMONY_LOGIN_DEDUCTION_RATE) {
  const base = parseHarmonyScore(baseScore);
  if (base == null) return null;
  return Math.max(0, Math.round(base * (1 - rate)));
}

export async function applyHarmonyLoginDeduction(student, rate = HARMONY_LOGIN_DEDUCTION_RATE) {
  const deducted = computeHarmonyAfterBiometricLogin(student, {
    academicProgress: student?.academicProgress,
    behaviorIntensity: student?.behaviorIntensity,
  });
  if (deducted == null || !student?.id) {
    const current =
      parseHarmonyScore(student?.harmonyScore) ??
      parseHarmonyScore(getField(student?.fields, SF.harmony_score));
    return { previous: current, deducted: null };
  }

  await syncHarmonyToAirtable(student.id, deducted);
  const previous =
    parseHarmonyScore(student?.harmonyScore) ??
    parseHarmonyScore(getField(student?.fields, SF.harmony_score));

  return { previous, deducted };
}

/** Initialize the 66-field smart session registry for digital sovereignty. */
export async function initializeSovereignSessionRegistry(student, startedAt = new Date().toISOString()) {
  if (!student?.id) return { startedAt, fieldCount: SESSION_FIELD_COUNT };

  const startDate = new Date(startedAt);
  const timeLabel = startDate.toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const studentIdCode =
    student?.studentCode ??
    getField(student?.fields, SF.id);

  try {
    await updateStudentRecord(student.id, {
      [SF.session_start_time]: timeLabel,
      [SF.clinical_session_status]: "live",
      [SF.smart_session_fields]: SESSION_FIELD_COUNT,
      [SF.biometric_attendance_verified]: true,
      [SF.biometric_attendance_at]: startedAt,
      ...(studentIdCode ? { [SF.id]: studentIdCode } : {}),
    });
  } catch {
    /* local session flags still activate registry UI */
  }

  return { startedAt, timeLabel, fieldCount: SESSION_FIELD_COUNT };
}

/** Read student Status — mapped student.status first, then Airtable fields. */
export function getStudentEnrollmentStatus(student) {
  const mapped = student?.status;
  if (mapped != null && String(mapped).trim() !== "") {
    return String(mapped).trim();
  }
  return getField(student?.fields, SF.status);
}

const VALID_LANDING_SECTIONS = new Set([
  "live",
  "media",
  "registry",
  "diagnostics",
  "learning",
  "crisis",
  "behavior",
  "enrollment",
]);

export { PREFERRED_LANDING_FIELD } from "./airtable";

/** Read «الوجهة المفضلة» — mapped preferredLanding first, then raw student fields. */
export function readPreferredLandingFromStudent(student) {
  const mapped = student?.preferredLanding;
  if (mapped != null && mapped !== "") {
    if (Array.isArray(mapped)) {
      const first = mapped.find((v) => v != null && String(v).trim() !== "");
      if (first != null) return String(first).trim();
    } else {
      return String(mapped).trim();
    }
  }

  const raw = getField(student?.fields, SF.preferred_destination);

  if (raw == null || raw === "") return "";

  if (Array.isArray(raw)) {
    const first = raw.find((v) => v != null && String(v).trim() !== "");
    return first != null ? String(first).trim() : "";
  }

  return String(raw).trim();
}

/** Map Airtable «الوجهة المفضلة» — English keys first, Arabic labels as fallback. */
const LANDING_OPTION_MAP = [
  {
    section: "diagnostics",
    patterns: [
      /^diagnostics$/i,
      /تقييم\s*شامل|comprehensive\s*assessment|initial\s*assessment/i,
      /نحو\s*التقييم\s*الشامل/i,
    ],
  },
  {
    section: "live",
    patterns: [
      /^live$/i,
      /السجل\s*الحي|live\s*registry|specialist\s*session/i,
      /مباشرة\s*للسجل\s*الحي/i,
    ],
  },
  {
    section: "media",
    patterns: [
      /^media$/i,
      /عالم\s*الجزر|island|digital\s*islands/i,
      /جزر\s*رقمي/i,
    ],
  },
  {
    section: "registry",
    patterns: [
      /^registry$/i,
      /سجل\s*الحالات|general\s*cases|session\s*registry/i,
      /لسجل\s*الحالات/i,
    ],
  },
];

function normalizeLandingSection(value, fallback = "live") {
  const raw =
    value == null || value === ""
      ? ""
      : Array.isArray(value)
        ? String(value.find((v) => v != null && String(v).trim() !== "") ?? "").trim()
        : String(value).trim();

  if (!raw) return fallback;

  const key = raw.toLowerCase();
  if (VALID_LANDING_SECTIONS.has(key)) return key;

  for (const { section, patterns } of LANDING_OPTION_MAP) {
    if (patterns.some((re) => re.test(raw))) return section;
  }

  return fallback;
}

/** @deprecated use readPreferredLandingFromStudent */
export function getPreferredLanding(student) {
  return readPreferredLandingFromStudent(student) || null;
}

function isNewEnrollmentStatus(statusRaw) {
  const status = String(statusRaw ?? "").trim().toLowerCase();
  return status === "new" || status === "جديد";
}

/** Smart routing: New → diagnostics (forced); Active → الوجهة المفضلة (English String). */
export function resolveBiometricLandingSection(student) {
  const statusRaw = getStudentEnrollmentStatus(student);
  const preferredRaw = readPreferredLandingFromStudent(student);

  if (isNewEnrollmentStatus(statusRaw)) {
    return "diagnostics";
  }

  const status = String(statusRaw ?? "").trim().toLowerCase();
  if (status === "active" || status === "نشط") {
    return normalizeLandingSection(preferredRaw, "live");
  }

  return "diagnostics";
}

/** Resolve session plan from student Status — New=FREE, Active=actual Airtable plan. */
export function resolveBiometricPlan(student) {
  const access = resolveEnrollmentAccess(getStudentEnrollmentStatus(student));
  if (access.tier === "new") return PLAN_CODES.FREE;
  if (access.tier === "active") {
    return resolvePlanFromStudentFields(student?.fields, getField);
  }
  return PLAN_CODES.FREE;
}

/** Build auth session and invoke login after ≥94.7% sovereign biometric match. */
export async function activateSovereignBiometricLogin(payload, login, lang = "ar") {
  const { student, similarityPercent, childCode } = payload;
  if (!student?.id) return null;

  const access = resolveEnrollmentAccess(getStudentEnrollmentStatus(student));
  if (!access.allowed) return null;

  const { deducted: harmonyScore } = await applyHarmonyLoginDeduction(student);
  const sessionStartedAt = new Date().toISOString();
  await initializeSovereignSessionRegistry(student, sessionStartedAt);

  const plan = resolveBiometricPlan(student);
  const landingSection = resolveBiometricLandingSection(student);
  const subscriptionRaw = getField(student?.fields, SF.subscription_status);

  const session = {
    role: ROLES.PARENT,
    plan,
    name: lang === "ar" ? "ولي الأمر" : "Parent",
    childName: student.name,
    childCode: childCode ?? deriveChildCode(student),
    studentCode:
      student.studentCode ??
      getField(student?.fields, SF.id) ??
      null,
    childId: student.id,
    activeStudentId: student.id,
    biometricSovereign: true,
    biometricAttendanceVerified: true,
    landingSection,
    harmonyScore,
    harmonyDeductionApplied: HARMONY_LOGIN_DEDUCTION_RATE,
    gazeObserverActive: true,
    sessionRegistryOpen: true,
    sessionStartedAt,
    sessionFieldCount: SESSION_FIELD_COUNT,
    similarityPercent,
    enrollmentStatus: getStudentEnrollmentStatus(student),
    subscriptionRaw: subscriptionRaw ?? null,
    dynamicSessionId: newDynamicSessionId(),
    activeGoalId: null,
    goalAttempts: [],
  };

  login(session);
  return session;
}
