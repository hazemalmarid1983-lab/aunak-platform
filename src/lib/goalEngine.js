/**
 * Dynamic Task Analysis & Flow — goal engine (AUN-4611).
 * Monitoring only: no 80% completion gate blocks navigation or goal switching.
 */

export const ENGINE_ID = "AUN-4611";

/** Documented threshold for reports — never used to block navigation. */
export const GOAL_REPORT_THRESHOLD = 80;

export const GOAL_SOURCES = {
  IEP: "IEP",
  ABC: "ABC",
  LEARNING: "Learning",
};

export function newDynamicSessionId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Specialists and AUN-4611 may always switch goals — no numeric lock. */
export function canSwitchGoal() {
  return true;
}

function goalKey(source, id, label) {
  return `${source}:${id}:${String(label ?? "").trim()}`;
}

function pushUniqueGoal(list, seen, entry) {
  const label = String(entry?.label ?? "").trim();
  if (!label) return;
  const key = goalKey(entry.source, entry.id, label);
  if (seen.has(key)) return;
  seen.add(key);
  list.push({ ...entry, label, key });
}

/** Merge approved goals from student IEP, ABC plans, and learning records. */
export function buildApprovedGoalList({ student, abcPlans = [], learningRecords = [] }) {
  const goals = [];
  const seen = new Set();
  const studentId = student?.id ?? null;

  if (student?.programmedGoal) {
    pushUniqueGoal(goals, seen, {
      id: studentId ? `iep-${studentId}` : "iep",
      source: GOAL_SOURCES.IEP,
      label: student.programmedGoal,
    });
  }

  for (const plan of abcPlans) {
    if (!plan?.title || plan.title === "—") continue;
    pushUniqueGoal(goals, seen, {
      id: plan.id,
      source: GOAL_SOURCES.ABC,
      label: plan.title,
    });
  }

  for (const rec of learningRecords) {
    if (studentId && rec?.studentLinkedId && rec.studentLinkedId !== studentId) continue;
    if (!rec?.goalLabel) continue;
    pushUniqueGoal(goals, seen, {
      id: rec.id,
      source: GOAL_SOURCES.LEARNING,
      label: rec.goalLabel,
    });
  }

  return goals;
}

export function startDynamicSession({ studentId, startedAt = new Date().toISOString() }) {
  return {
    sessionId: newDynamicSessionId(),
    studentId: studentId ?? null,
    startedAt,
  };
}

export function nextAttemptNumber(existingAttempts = [], goalKeyValue) {
  const forGoal = (existingAttempts || []).filter((a) => a.goalKey === goalKeyValue);
  const max = forGoal.reduce((m, a) => Math.max(m, Number(a.attemptNumber) || 0), 0);
  return max + 1;
}

/** Advisory suggestion when recent success is low — does not block manual switching. */
export function suggestAlternateGoal({ goals = [], attempts = [], activeGoalKey }) {
  if (!canSwitchGoal() || goals.length < 2) return null;

  const avgByGoal = {};
  for (const a of attempts) {
    const k = a.goalKey || a.goalLabel;
    if (!k) continue;
    if (!avgByGoal[k]) avgByGoal[k] = { sum: 0, n: 0 };
    const pct = Number(a.successPercent);
    if (Number.isFinite(pct)) {
      avgByGoal[k].sum += pct;
      avgByGoal[k].n += 1;
    }
  }

  const activeAvg =
    activeGoalKey && avgByGoal[activeGoalKey]?.n
      ? avgByGoal[activeGoalKey].sum / avgByGoal[activeGoalKey].n
      : null;

  if (activeAvg == null || activeAvg >= GOAL_REPORT_THRESHOLD) return null;

  const alternate = goals.find((g) => g.key !== activeGoalKey);
  if (!alternate) return null;

  return {
    engineId: ENGINE_ID,
    reason:
      activeAvg < GOAL_REPORT_THRESHOLD
        ? "low_response"
        : "advisory",
    suggestedGoal: alternate,
    activeAverage: Math.round(activeAvg),
  };
}

export function summarizeSessionAttempts(attempts = []) {
  const byGoal = {};
  for (const a of attempts) {
    const label = a.goalLabel || a.goalKey || "—";
    if (!byGoal[label]) byGoal[label] = { label, count: 0, sum: 0 };
    byGoal[label].count += 1;
    const pct = Number(a.successPercent);
    if (Number.isFinite(pct)) byGoal[label].sum += pct;
  }
  return Object.values(byGoal).map((row) => ({
    goalLabel: row.label,
    attemptCount: row.count,
    averageSuccess:
      row.count > 0 ? Math.round(row.sum / row.count) : null,
  }));
}

export function summarizeWeeklyAttempts(attempts = []) {
  const byGoal = {};
  for (const a of attempts) {
    const label = a.goalLabel || "—";
    if (!byGoal[label]) byGoal[label] = { goalLabel: label, attemptCount: 0, sum: 0 };
    byGoal[label].attemptCount += 1;
    const pct = Number(a.successPercent);
    if (Number.isFinite(pct)) byGoal[label].sum += pct;
  }
  return Object.values(byGoal)
    .map((row) => ({
      goalLabel: row.goalLabel,
      attemptCount: row.attemptCount,
      averageSuccess:
        row.attemptCount > 0 ? Math.round(row.sum / row.attemptCount) : null,
    }))
    .sort((a, b) => b.attemptCount - a.attemptCount);
}

export function weekRangeIso(referenceDate = new Date()) {
  const d = new Date(referenceDate);
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const start = new Date(d);
  start.setDate(d.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return {
    weekStart: start.toISOString().slice(0, 10),
    weekEnd: end.toISOString().slice(0, 10),
  };
}

const SESSION_ATTENDANCE_TOLERANCE_MS = 8 * 60 * 60 * 1000;

function readStudentAttendanceField(fields, ...keys) {
  if (!fields || typeof fields !== "object") return null;
  for (const key of keys) {
    const v = fields[key];
    if (v != null && v !== "") return v;
  }
  return null;
}

function isTruthyAttendance(value) {
  if (value === true || value === 1) return true;
  const s = String(value ?? "").trim().toLowerCase();
  return s === "true" || s === "1" || s === "yes" || s === "نعم" || s === "verified";
}

/**
 * AUN-4611 financial attestation — child must be biometrically present within session window.
 */
export function verifyAun4611SessionAttestation({ user, activeStudent }) {
  if (!user?.activeStudentId || !activeStudent?.id) {
    return { verified: false, engineId: ENGINE_ID, reason: "no_active_student" };
  }
  if (user.activeStudentId !== activeStudent.id) {
    return { verified: false, engineId: ENGINE_ID, reason: "student_mismatch" };
  }
  if (!user.dynamicSessionId) {
    return { verified: false, engineId: ENGINE_ID, reason: "no_session_id" };
  }

  const f = activeStudent.fields ?? {};
  const attendanceVerified =
    isTruthyAttendance(readStudentAttendanceField(f, "Biometric Attendance Verified")) ||
    user.biometricAttendanceVerified === true ||
    (user.biometricSovereign === true && Boolean(user.sessionRegistryOpen));

  if (!attendanceVerified) {
    return { verified: false, engineId: ENGINE_ID, reason: "biometric_not_verified" };
  }

  const attendanceAtRaw =
    readStudentAttendanceField(f, "Biometric Attendance At") || user.sessionStartedAt;
  const sessionStart = user.sessionStartedAt;

  if (!attendanceAtRaw || !sessionStart) {
    return { verified: false, engineId: ENGINE_ID, reason: "missing_timestamps" };
  }

  const attendanceMs = new Date(attendanceAtRaw).getTime();
  const sessionMs = new Date(sessionStart).getTime();
  if (Number.isNaN(attendanceMs) || Number.isNaN(sessionMs)) {
    return { verified: false, engineId: ENGINE_ID, reason: "invalid_timestamps" };
  }

  if (Math.abs(sessionMs - attendanceMs) > SESSION_ATTENDANCE_TOLERANCE_MS) {
    return { verified: false, engineId: ENGINE_ID, reason: "attendance_outside_window" };
  }

  return {
    verified: true,
    engineId: ENGINE_ID,
    reason: "attested",
    attendanceAt: attendanceAtRaw,
  };
}
