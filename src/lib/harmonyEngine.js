/**
 * Harmony Score — sovereign passage equation:
 *   Harmony Score = Base − (Gap × 0.2)
 * Avoids statistical deception from raw averages without gap penalty.
 */

import {
  parseHarmonyScore,
  updateStudentRecord,
  getField,
  fetchStudents,
  STUDENT as SF,
} from "./airtable";
import { HARMONY_DEDUCTION_RATE } from "./sovereignProtocol";

export const HARMONY_GAP_THRESHOLD = 0;
export const HARMONY_GAP_PENALTY_RATE = HARMONY_DEDUCTION_RATE;
export const HARMONY_LOGIN_DEDUCTION_RATE = HARMONY_DEDUCTION_RATE;

export function normalize0to100(value) {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/%/g, "").trim());
  if (!Number.isFinite(n)) return null;
  if (n <= 1 && n >= 0) return Math.round(n * 100);
  return Math.max(0, Math.min(100, Math.round(n)));
}

/**
 * Core harmony: Base − (Gap × 0.2).
 * Gap = |academicProgress − behaviorIntensity|.
 */
export function computeHarmonyScore({ academicProgress, behaviorIntensity, baseScore }) {
  const academic = normalize0to100(academicProgress);
  const behavior = normalize0to100(behaviorIntensity);

  let base =
    parseHarmonyScore(baseScore) ??
    (academic != null && behavior != null
      ? Math.round((academic + (100 - behavior)) / 2)
      : academic ?? (behavior != null ? Math.round(100 - behavior) : null));

  if (base == null) return null;

  let score = base;
  if (academic != null && behavior != null) {
    const gap = Math.abs(academic - behavior);
    score = Math.round(base - gap * HARMONY_GAP_PENALTY_RATE);
  }

  return Math.max(0, Math.min(100, score));
}

/** Apply login deduction then gap-aware harmony recompute. */
export function computeHarmonyAfterBiometricLogin(student, metrics = {}) {
  const base =
    parseHarmonyScore(student?.harmonyScore) ??
    parseHarmonyScore(getField(student?.fields, SF.harmony_score));

  const afterLogin =
    base != null ? Math.max(0, Math.round(base * (1 - HARMONY_LOGIN_DEDUCTION_RATE))) : null;

  return computeHarmonyScore({
    academicProgress: metrics.academicProgress ?? student?.academicProgress,
    behaviorIntensity: metrics.behaviorIntensity ?? student?.behaviorIntensity,
    baseScore: afterLogin ?? base,
  });
}

export async function syncHarmonyToAirtable(studentId, score) {
  if (!studentId || score == null) return null;
  try {
    await updateStudentRecord(studentId, {
      [SF.harmony_score]: score,
    });
  } catch {
    /* non-blocking */
  }
  return score;
}

/** Load learning + ABC metrics for a student and persist harmony. */
export async function refreshStudentHarmony(studentId, { fetchAbcForStudent, fetchLearningForStudent } = {}) {
  if (!studentId) return null;

  const students = await fetchStudents();
  const student = (Array.isArray(students) ? students : []).find((s) => s.id === studentId);
  if (!student) return null;

  let academicProgress = student.academicProgress ?? null;
  let behaviorIntensity = student.behaviorIntensity ?? null;

  if (typeof fetchLearningForStudent === "function") {
    const learning = await fetchLearningForStudent(studentId);
    if (learning?.academicProgress != null) academicProgress = learning.academicProgress;
  }

  if (typeof fetchAbcForStudent === "function") {
    const abc = await fetchAbcForStudent(studentId);
    if (abc?.intensity != null) behaviorIntensity = normalize0to100(abc.intensity);
  }

  const score = computeHarmonyScore({
    academicProgress,
    behaviorIntensity,
    baseScore: student.harmonyScore,
  });

  if (score != null) await syncHarmonyToAirtable(studentId, score);
  return { score, academicProgress, behaviorIntensity };
}
