/** Sovereign clinical protocol constants — single source of truth */
export const MELTDOWN_LATENCY_MS = 280;
export const GAZE_HOLD_MS = 5000;
export const HARMONY_DEDUCTION_RATE = 0.2;
export const BIOMETRIC_CONFIDENCE = 94.7;
export const SESSION_FIELD_COUNT = 66;

export function buildSpecialistClinicalSession(baseSession) {
  return {
    ...baseSession,
    sessionRegistryOpen: true,
    gazeObserverActive: true,
    neuralEngineActive: true,
    sessionFieldCount: SESSION_FIELD_COUNT,
    dynamicSessionId: baseSession?.dynamicSessionId ?? null,
    sessionStartedAt: baseSession?.sessionStartedAt ?? new Date().toISOString(),
  };
}

export function summarizeSessionProtocols(user) {
  if (!user) return null;
  return {
    role: user.role,
    biometricSovereign: Boolean(user.biometricSovereign),
    sessionRegistryOpen: Boolean(user.sessionRegistryOpen),
    gazeObserverActive: Boolean(user.gazeObserverActive),
    neuralEngineActive: Boolean(user.neuralEngineActive),
    harmonyDeductionApplied: user.harmonyDeductionApplied ?? null,
    harmonyScore: user.harmonyScore ?? null,
    landingSection: user.landingSection ?? null,
    enrollmentStatus: user.enrollmentStatus ?? null,
    sessionFieldCount: user.sessionFieldCount ?? null,
    fieldInspection: Boolean(user.fieldInspection),
  };
}

/** Shared gaze neutrality trigger — focusLevel < 64 or tStatic ≥ 5 seconds. */
export function detectGazeNeutralityCondition(student) {
  if (!student) return false;
  const focus = student.focusLevel ?? student.improvementIndex;
  const tStatic = student.tStatic;
  if (focus != null && Number(focus) < 64) return true;
  if (tStatic != null && Number(tStatic) >= 5) return true;
  return false;
}
