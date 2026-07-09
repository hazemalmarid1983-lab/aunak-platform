import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createGoalAttempt,
  fetchSessionGoalAttempts,
  fetchWeeklyGoalAttempts,
} from "../lib/airtable";
import { mapGoalAttempt } from "../lib/airtableMappers";
import {
  buildApprovedGoalList,
  canSwitchGoal,
  nextAttemptNumber,
  newDynamicSessionId,
  suggestAlternateGoal,
  summarizeSessionAttempts,
  summarizeWeeklyAttempts,
  weekRangeIso,
} from "../lib/goalEngine";

export function useGoalEngine({
  lang = "ar",
  student,
  abcPlans = [],
  learningRecords = [],
  sessionId: sessionIdProp,
  specialistEmail = "",
  patchSession,
  sessionAttemptsCache = [],
}) {
  const studentId = student?.id ?? null;

  const sessionId = useMemo(() => {
    if (sessionIdProp) return sessionIdProp;
    return newDynamicSessionId();
  }, [sessionIdProp]);

  const approvedGoals = useMemo(
    () => buildApprovedGoalList({ student, abcPlans, learningRecords }),
    [student, abcPlans, learningRecords]
  );

  const [activeGoalKey, setActiveGoalKey] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (approvedGoals.length === 0) {
      setActiveGoalKey(null);
      return;
    }
    setActiveGoalKey((prev) => {
      if (prev && approvedGoals.some((g) => g.key === prev)) return prev;
      return approvedGoals[0].key;
    });
  }, [approvedGoals]);

  const reloadAttempts = useCallback(async () => {
    if (!sessionId) return;
    setLoadingAttempts(true);
    setError("");
    try {
      const raw = await fetchSessionGoalAttempts(sessionId);
      const mapped = raw.map((r) => mapGoalAttempt(r, lang));
      setAttempts(mapped);
      if (typeof patchSession === "function") {
        patchSession({ goalAttempts: mapped });
      }
    } catch (e) {
      setError(e?.message || (lang === "en" ? "Failed to load attempts" : "فشل تحميل المحاولات"));
    } finally {
      setLoadingAttempts(false);
    }
  }, [sessionId, lang, patchSession]);

  useEffect(() => {
    if (sessionAttemptsCache?.length && attempts.length === 0) {
      setAttempts(sessionAttemptsCache);
    }
  }, [sessionAttemptsCache, attempts.length]);

  useEffect(() => {
    reloadAttempts();
  }, [reloadAttempts]);

  const reloadWeekly = useCallback(async () => {
    if (!studentId) return;
    const { weekStart, weekEnd } = weekRangeIso();
    try {
      const raw = await fetchWeeklyGoalAttempts({ studentId, weekStart, weekEnd });
      const mapped = raw.map((r) => mapGoalAttempt(r, lang));
      setWeeklySummary(summarizeWeeklyAttempts(mapped));
    } catch {
      setWeeklySummary([]);
    }
  }, [studentId, lang]);

  useEffect(() => {
    reloadWeekly();
  }, [reloadWeekly]);

  const activeGoal = useMemo(
    () => approvedGoals.find((g) => g.key === activeGoalKey) ?? null,
    [approvedGoals, activeGoalKey]
  );

  const switchGoal = useCallback(
    (goalKey) => {
      if (!canSwitchGoal()) return false;
      if (!approvedGoals.some((g) => g.key === goalKey)) return false;
      setActiveGoalKey(goalKey);
      if (typeof patchSession === "function") {
        patchSession({ activeGoalId: goalKey });
      }
      return true;
    },
    [approvedGoals, patchSession]
  );

  const recordAttempt = useCallback(
    async ({ successPercent, notes = "" }) => {
      if (!activeGoal || !studentId) return null;
      setRecording(true);
      setError("");
      try {
        const attemptNumber = nextAttemptNumber(attempts, activeGoal.key);
        const pct = Math.min(100, Math.max(0, Number(successPercent)));
        if (!Number.isFinite(pct)) {
          throw new Error(lang === "en" ? "Invalid success percent" : "نسبة النجاح غير صالحة");
        }
        await createGoalAttempt({
          studentId,
          sessionId,
          sessionDate: new Date().toISOString().slice(0, 10),
          goalLabel: activeGoal.label,
          goalSource: activeGoal.source,
          successPercent: pct,
          attemptNumber,
          specialistEmail,
          attemptNotes: notes,
        });
        await reloadAttempts();
        await reloadWeekly();
        return attemptNumber;
      } catch (e) {
        setError(e?.message || (lang === "en" ? "Failed to record attempt" : "فشل تسجيل المحاولة"));
        return null;
      } finally {
        setRecording(false);
      }
    },
    [
      activeGoal,
      studentId,
      sessionId,
      attempts,
      specialistEmail,
      lang,
      reloadAttempts,
      reloadWeekly,
    ]
  );

  const advisory = useMemo(
    () =>
      suggestAlternateGoal({
        goals: approvedGoals,
        attempts,
        activeGoalKey,
      }),
    [approvedGoals, attempts, activeGoalKey]
  );

  const sessionSummary = useMemo(() => summarizeSessionAttempts(attempts), [attempts]);

  return {
    sessionId,
    approvedGoals,
    activeGoal,
    activeGoalKey,
    switchGoal,
    canSwitchGoal: canSwitchGoal(),
    attempts,
    sessionSummary,
    weeklySummary,
    advisory,
    loadingAttempts,
    recording,
    error,
    recordAttempt,
    reloadAttempts,
    reloadWeekly,
  };
}
