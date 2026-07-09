<!-- AUNAK CONTEXT — Part 3 | lines 10001-15000 of 28509 | main + Tawasul (English Island excluded) -->

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
````

## File: src/hooks/useHarmonyEngine.js
````javascript
import { useEffect, useState } from "react";
import { fetchStudents } from "../lib/airtable";
import { fetchAirtableRecords } from "../lib/airtable";
import { AIRTABLE_TABLES } from "../lib/airtableTables";
import { mapLearningRecord, mapAbcPlan } from "../lib/airtableMappers";
import { refreshStudentHarmony } from "../lib/harmonyEngine";
import { useAuth } from "../lib/auth";

/** Recompute harmony when active student session loads. */
export function useHarmonyEngine() {
  const { user, patchSession } = useAuth();
  const [harmony, setHarmony] = useState(user?.harmonyScore ?? null);
  const studentId = user?.activeStudentId ?? user?.childId ?? null;

  useEffect(() => {
    if (!studentId || !user?.biometricSovereign) return undefined;
    let cancelled = false;

    const fetchLearningForStudent = async (sid) => {
      const records = await fetchAirtableRecords(AIRTABLE_TABLES.learningDifficulties);
      const mapped = records.map((r) => mapLearningRecord(r));
      return mapped.find((r) => r.studentLinkedId === sid) ?? mapped[0] ?? null;
    };

    const fetchAbcForStudent = async () => {
      const records = await fetchAirtableRecords(AIRTABLE_TABLES.abcData);
      const mapped = records.map((r) => mapAbcPlan(r));
      return mapped[0] ?? null;
    };

    refreshStudentHarmony(studentId, { fetchLearningForStudent, fetchAbcForStudent })
      .then((result) => {
        if (cancelled || result?.score == null) return;
        setHarmony(result.score);
        patchSession({ harmonyScore: result.score });
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [studentId, user?.biometricSovereign, patchSession]);

  return { harmonyScore: harmony ?? user?.harmonyScore ?? null };
}

export async function loadStudentById(studentId) {
  const rows = await fetchStudents();
  return (Array.isArray(rows) ? rows : []).find((s) => s.id === studentId) ?? null;
}
````

## File: src/hooks/useMeltdownPredictor.js
````javascript
import { useEffect, useRef, useState, useCallback } from "react";
import { playWarningPulse } from "../lib/sovereignAudio";
import { MELTDOWN_LATENCY_MS } from "../lib/sovereignProtocol";
import { computeRiskScore, CRISIS_RISK_THRESHOLD } from "./useCrisisAlerts";

/**
 * Meltdown AI — flags rapid agitation bursts when inter-input latency ≤ 280ms.
 * Fuses with weighted ABC risk equation when burst threshold is met.
 */
export function useMeltdownPredictor({ active, lang = "ar", abc = {} } = {}) {
  const [meltdownRisk, setMeltdownRisk] = useState(false);
  const [burstCount, setBurstCount] = useState(0);
  const [riskScore, setRiskScore] = useState(0);
  const lastEventRef = useRef(0);
  const streakRef = useRef(0);

  const intensity = meltdownRisk ? Math.max(Number(abc.intensity) || 1, 3) : Number(abc.intensity) || 1;
  const frequency = Number(abc.frequency) || 1;
  const duration = Number(abc.duration) || 1;

  const copy = {
    ar: { alert: "تنبيه Meltdown AI — عتبة 280ms", body: "رُصدت سلسلة استجابات سريعة؛ فعّل بروتوكول التهدئة." },
    en: { alert: "Meltdown AI — 280ms threshold", body: "Rapid response burst detected; activate de-escalation protocol." },
  }[lang] ?? { alert: "Meltdown AI", body: "" };

  const onPointerActivity = useCallback(
    (eventType) => {
      if (!active) return;
      const now = performance.now();
      const delta = lastEventRef.current ? now - lastEventRef.current : Infinity;
      lastEventRef.current = now;

      if (delta <= MELTDOWN_LATENCY_MS) {
        streakRef.current += 1;
        if (streakRef.current >= 3) {
          const I = Math.max(Number(abc.intensity) || 1, 3);
          const F = Number(abc.frequency) || 1;
          const D = Number(abc.duration) || 1;
          const risk = computeRiskScore(I, F, D);
          setRiskScore(risk);
          setMeltdownRisk(risk > CRISIS_RISK_THRESHOLD || streakRef.current >= 3);
          setBurstCount(streakRef.current);
          playWarningPulse();
        }
      } else {
        streakRef.current = 0;
        if (delta > MELTDOWN_LATENCY_MS * 4) {
          setMeltdownRisk(false);
          setRiskScore(0);
        }
      }
    },
    [active, abc.intensity, abc.frequency, abc.duration]
  );

  useEffect(() => {
    if (!active) {
      streakRef.current = 0;
      lastEventRef.current = 0;
      setMeltdownRisk(false);
      setBurstCount(0);
      setRiskScore(0);
      return undefined;
    }

    const onKey = () => onPointerActivity("keydown");
    const onClick = () => onPointerActivity("click");
    window.addEventListener("keydown", onKey, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("click", onClick);
    };
  }, [active, onPointerActivity]);

  const fusedCritical = meltdownRisk && riskScore > CRISIS_RISK_THRESHOLD;

  return {
    meltdownRisk,
    burstCount,
    riskScore,
    fusedCritical,
    alertTitle: copy.alert,
    alertBody: fusedCritical
      ? `${copy.body} — Risk: ${riskScore.toFixed(1)}`
      : copy.body,
  };
}
````

## File: src/hooks/useParentDashboard.js
````javascript
import { useCallback, useEffect, useState } from 'react';
import { fetchStudents } from '../lib/airtable';
import {
  buildParentAssessmentView,
  buildTreatmentMetrics,
  fetchParentSessionLedger,
  sessionAttendanceSummary,
} from '../lib/parentDashboardEngine';

export function useParentDashboard(student, lang = 'ar') {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [sessionsError, setSessionsError] = useState('');
  const [studentFresh, setStudentFresh] = useState(student);
  const [refreshing, setRefreshing] = useState(false);

  const assessment = buildParentAssessmentView(studentFresh ?? student, lang);
  const treatment = buildTreatmentMetrics(studentFresh ?? student, lang);
  const attendance = sessionAttendanceSummary(sessions, lang);

  const reloadSessions = useCallback(async () => {
    const row = studentFresh ?? student;
    if (!row?.name) {
      setSessions([]);
      return;
    }
    setSessionsLoading(true);
    setSessionsError('');
    try {
      const rows = await fetchParentSessionLedger(row);
      setSessions(rows);
      setSessionsError('');
    } catch {
      setSessions([]);
      setSessionsError('');
    } finally {
      setSessionsLoading(false);
    }
  }, [student, studentFresh]);

  const refreshAll = useCallback(async () => {
    const id = (studentFresh ?? student)?.id;
    if (!id) return;
    setRefreshing(true);
    try {
      const list = await fetchStudents();
      const row = list.find((s) => s.id === id) ?? student;
      setStudentFresh(row);
      const rows = await fetchParentSessionLedger(row);
      setSessions(rows);
    } catch {
      setSessionsError('');
    } finally {
      setRefreshing(false);
    }
  }, [student, studentFresh]);

  useEffect(() => {
    setStudentFresh(student);
  }, [student]);

  useEffect(() => {
    reloadSessions();
  }, [reloadSessions]);

  return {
    assessment,
    treatment,
    sessions,
    attendance,
    sessionsLoading,
    sessionsError,
    refreshing,
    refreshAll,
    reloadSessions,
  };
}
````

## File: src/hooks/usePromoVoice.js
````javascript
import { useCallback, useEffect, useRef } from 'react';

const PROMO_SCRIPT = {
  ar: `ولي الأمر الكريم…
طفلك يحمل قدرات حقيقية… لكن بدون التقييم الشامل الكامل، تبقى نصف الصورة مخفية.
التقييم الشامل في عونك يختصر أشهراً من التخمين… ويمنحك خطة تأهيل دقيقة… مبنية على بيانات… لا على ظنون.
لا تترك فرصة طفلك للصدفة… فعّل الباقة الشاملة… وابدأ اليوم.`,
  en: `Dear parent…
Your child has real abilities — but without the full comprehensive assessment, half the picture stays hidden.
Aunak's full assessment saves months of guessing and delivers a precise rehabilitation plan built on data, not assumptions.
Don't leave your child's future to chance — activate the full plan and start today.`,
};

export function usePromoVoice(lang = 'ar') {
  const speakingRef = useRef(false);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    speakingRef.current = false;
  }, []);

  const speak = useCallback(
    (text) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      stop();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'en' ? 'en-US' : 'ar-SA';
      utter.rate = 0.82;
      utter.pitch = 0.75;
      utter.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith(lang === 'en' ? 'en' : 'ar') &&
          (/male|google|natural/i.test(v.name) || v.localService === false)
      );
      if (preferred) utter.voice = preferred;
      utter.onend = () => {
        speakingRef.current = false;
      };
      speakingRef.current = true;
      window.speechSynthesis.speak(utter);
    },
    [lang, stop]
  );

  const speakPromo = useCallback(() => {
    speak(PROMO_SCRIPT[lang] ?? PROMO_SCRIPT.ar);
  }, [lang, speak]);

  useEffect(() => () => stop(), [stop]);

  return { speak, speakPromo, stop, isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window };
}

export { PROMO_SCRIPT };
````

## File: src/hooks/useRoadmapStats.js
````javascript
import { useEffect, useMemo, useState } from "react";
import { fetchStudents } from "../lib/airtable";

/** Roadmap counts by student Status (New / Active / Other). */
export function useRoadmapStats({ enabled = true } = {}) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!enabled) return undefined;
    let cancelled = false;
    setLoading(true);
    fetchStudents()
      .then((rows) => {
        if (!cancelled) setStudents(Array.isArray(rows) ? rows : []);
      })
      .catch(() => {
        if (!cancelled) setStudents([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const stats = useMemo(() => {
    const counts = { new: 0, active: 0, other: 0 };
    for (const s of students) {
      const raw = String(s?.status ?? s?.fields?.Status ?? "").trim().toLowerCase();
      if (raw === "new" || raw === "جديد") counts.new += 1;
      else if (raw === "active" || raw === "نشط") counts.active += 1;
      else counts.other += 1;
    }
    return counts;
  }, [students]);

  return { stats, loading, students };
}
````

## File: src/hooks/useSovereignVoice.js
````javascript
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  parseSovereignCommand,
  speakText,
} from "../lib/sovereignVoice";

/**
 * Sovereign STT/TTS — armed only when biometricSovereign session is active.
 */
export function useSovereignVoice({ enabled, lang = "ar", onCommand }) {
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [error, setError] = useState("");
  const recRef = useRef(null);

  const speechLang = lang === "ar" ? "ar-SA" : "en-US";
  const supported = isSpeechRecognitionSupported();

  const stopListening = useCallback(() => {
    recRef.current?.stop?.();
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!enabled || !supported) {
      setError(lang === "ar" ? "التخاطب غير متاح" : "Voice not available");
      return;
    }
    setError("");
    const rec = createSpeechRecognition({ lang: speechLang, continuous: false });
    if (!rec) return;
    recRef.current = rec;

    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      setLastTranscript(transcript);
      const cmd = parseSovereignCommand(transcript, lang);
      onCommand?.(cmd, transcript);
      if (cmd?.type === "navigate") {
        speakText(lang === "ar" ? `توجيه إلى ${cmd.section}` : `Navigating to ${cmd.section}`, { lang: speechLang });
      } else if (cmd?.type === "manualOverride") {
        speakText(lang === "ar" ? "تفعيل التحكم اليدوي" : "Manual override toggled", { lang: speechLang });
      }
    };

    rec.onerror = () => {
      setError(lang === "ar" ? "خطأ في الاستماع" : "Listening error");
      setListening(false);
    };

    rec.onend = () => setListening(false);

    rec.start();
    setListening(true);
  }, [enabled, supported, speechLang, lang, onCommand]);

  useEffect(() => () => stopListening(), [stopListening]);

  return {
    listening,
    lastTranscript,
    error,
    supported,
    ttsSupported: isSpeechSynthesisSupported(),
    startListening,
    stopListening,
    speak: (text) => speakText(text, { lang: speechLang }),
  };
}
````

## File: src/hooks/useSummerAcademy.js
````javascript
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../lib/auth';
import { useAirtableData } from './useAirtableData';
import { AIRTABLE_TABLES } from '../lib/airtableTables';
import { mapMedia } from '../lib/airtableMappers';
import {
  defaultProgress,
  computeSilentAssessment,
  completeDailyTask,
  buildPositiveLeaderboard,
  composeWeeklyParentReport,
  composeLeapCertificate,
  filterBrainMedia,
  spinBrainWheel,
  WELCOME_MISSION,
  TRACKS,
  TRACK_IDS,
  todayKey,
} from '../lib/summerAcademyEngine';
import {
  loadStudentProgress,
  saveLocalProgress,
  saveSilentAssessment,
  saveProgressSnapshot,
  fetchLeaderboardEntries,
} from '../lib/summerAcademyAirtable';

export function useSummerAcademy({ lang = 'ar' } = {}) {
  const { user } = useAuth();
  const studentId = user?.childId ?? user?.activeStudentId ?? user?.studentId ?? null;
  const studentName = user?.childName ?? user?.name ?? (lang === 'en' ? 'Explorer' : 'مغامر');

  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('welcome');
  const [welcomeStarted, setWelcomeStarted] = useState(false);
  const [welcomeAnswers, setWelcomeAnswers] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [wheelTrack, setWheelTrack] = useState(null);
  const [lastMessage, setLastMessage] = useState('');

  const { records: mediaLibrary } = useAirtableData(AIRTABLE_TABLES.safeMedia, {
    mapRecord: mapMedia,
    lang,
  });

  const brainMedia = useMemo(() => filterBrainMedia(mediaLibrary), [mediaLibrary]);
  const mission = WELCOME_MISSION[lang] ?? WELCOME_MISSION.ar;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const saved = await loadStudentProgress(studentId);
      if (cancelled) return;
      if (saved) {
        setProgress(saved);
        setView(saved.welcomeComplete ? 'hub' : 'welcome');
      } else {
        setProgress(defaultProgress(studentId, studentName));
        setView('welcome');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId, studentName]);

  useEffect(() => {
    fetchLeaderboardEntries().then(setLeaderboard).catch(() => setLeaderboard([]));
  }, [progress?.totalXp]);

  const persist = useCallback(
    async (next) => {
      setProgress(next);
      saveLocalProgress(studentId, next);
      await saveProgressSnapshot({ studentId, studentName, progress: next });
    },
    [studentId, studentName]
  );

  const startWelcome = useCallback(() => {
    setWelcomeStarted(true);
    setWelcomeAnswers([]);
    setLastMessage('');
  }, []);

  const answerWelcome = useCallback(
    (optionIndex) => {
      const nextAnswers = [...welcomeAnswers, optionIndex];
      setWelcomeAnswers(nextAnswers);

      if (nextAnswers.length >= mission.questions.length) {
        const assessment = computeSilentAssessment(nextAnswers, mission.questions);
        setLastMessage(assessment.encouragement);

        const next = {
          ...(progress ?? defaultProgress(studentId, studentName)),
          welcomeComplete: true,
          baselineLevels: assessment.levels,
          currentLevels: { ...assessment.levels },
          weakPoints: assessment.weakPoints,
        };
        persist(next);
        saveSilentAssessment({ studentId, studentName, assessment });
        setView('hub');
        return;
      }
    },
    [welcomeAnswers, mission, progress, studentId, studentName, persist]
  );

  const completeTask = useCallback(
    async (trackId) => {
      const base = progress ?? defaultProgress(studentId, studentName);
      const result = completeDailyTask(base, trackId, lang);
      setLastMessage(result.encouragement);
      if (!result.alreadyDone) {
        await persist(result.progress);
      }
      return result;
    },
    [progress, studentId, studentName, lang, persist]
  );

  const spinWheel = useCallback(() => {
    const track = spinBrainWheel(TRACK_IDS);
    setWheelTrack(track);
    return track;
  }, []);

  const weeklyReport = useMemo(() => {
    if (!progress) return null;
    const day = todayKey();
    const weekTasks = Object.entries(progress.dailyLog ?? {})
      .filter(([d]) => {
        const diff = (new Date(day) - new Date(d)) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff < 7;
      })
      .reduce((s, [, v]) => s + (v.tasks?.length ?? 0), 0);
    const weekXp = Object.entries(progress.dailyLog ?? {})
      .filter(([d]) => {
        const diff = (new Date(day) - new Date(d)) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff < 7;
      })
      .reduce((s, [, v]) => s + (v.xp ?? 0), 0);

    return composeWeeklyParentReport(
      {
        ...progress,
        studentName,
        tasksThisWeek: weekTasks,
        xpThisWeek: weekXp,
      },
      lang
    );
  }, [progress, studentName, lang]);

  const leapCertificate = useMemo(() => {
    if (!progress) return null;
    return composeLeapCertificate({ ...progress, studentName }, lang);
  }, [progress, studentName, lang]);

  const positiveLeaderboard = useMemo(
    () => buildPositiveLeaderboard(leaderboard, lang),
    [leaderboard, lang]
  );

  const currentQuestion = welcomeStarted ? (mission.questions[welcomeAnswers.length] ?? null) : null;
  const todayTasks = progress?.dailyLog?.[todayKey()]?.tasks ?? [];

  return {
    loading,
    progress,
    view,
    setView,
    mission,
    welcomeStarted,
    welcomeAnswers,
    currentQuestion,
    startWelcome,
    answerWelcome,
    lastMessage,
    completeTask,
    todayTasks,
    brainMedia,
    spinWheel,
    wheelTrack,
    weeklyReport,
    leapCertificate,
    positiveLeaderboard,
    tracks: TRACKS,
    trackIds: TRACK_IDS,
    studentName,
  };
}
````

## File: src/hooks/useTawasulIdleGaze.js
````javascript
import { useEffect, useRef } from 'react';
import { playTypewriterEffect } from '../lib/sovereignAudio';
import { GAZE_HOLD_MS } from '../lib/sovereignProtocol';

/**
 * Tawasul child — idle gaze proxy (no biometric metrics): 5s without interaction → typewriter.
 */
export function useTawasulIdleGaze({ active, onTrigger, holdMs = GAZE_HOLD_MS }) {
  const lastActivityRef = useRef(Date.now());
  const firedRef = useRef(false);

  useEffect(() => {
    if (!active) {
      firedRef.current = false;
      return undefined;
    }

    const bump = () => {
      lastActivityRef.current = Date.now();
      firedRef.current = false;
    };

    window.addEventListener('pointerdown', bump);
    window.addEventListener('keydown', bump);
    window.addEventListener('touchstart', bump);

    const tick = setInterval(() => {
      if (firedRef.current) return;
      if (Date.now() - lastActivityRef.current >= holdMs) {
        firedRef.current = true;
        playTypewriterEffect(24);
        onTrigger?.();
      }
    }, 500);

    return () => {
      clearInterval(tick);
      window.removeEventListener('pointerdown', bump);
      window.removeEventListener('keydown', bump);
      window.removeEventListener('touchstart', bump);
    };
  }, [active, holdMs, onTrigger]);
}
````

## File: src/lib/academyTheme.js
````javascript
/** Summer Academy — warm playful theme (isolated from LUX dark). */

export const ACADEMY_MOODS = {
  idle: 'idle',
  thinking: 'thinking',
  challenge: 'challenge',
  celebrate: 'celebrate',
};

export const ACADEMY = {
  root: 'academy-live-root min-h-screen text-slate-800 font-sans overflow-x-hidden',
  header:
    'sticky top-0 z-30 px-4 py-3 md:px-8 flex items-center justify-between backdrop-blur-xl bg-white/40 border-b border-white/50 shadow-sm',
  main: 'relative z-10 max-w-6xl mx-auto p-4 md:p-8 space-y-6',
  card: 'rounded-3xl p-5 md:p-6 bg-white/75 backdrop-blur-xl border border-white/80 shadow-[0_8px_32px_rgba(255,120,80,0.12)] transition-all duration-500',
  cardCelebrate:
    'rounded-3xl p-5 md:p-6 bg-white/85 backdrop-blur-xl border-2 border-amber-300/80 shadow-[0_0_48px_rgba(255,200,50,0.35)]',
  title: 'text-2xl md:text-3xl font-black bg-gradient-to-l from-orange-500 via-pink-500 to-violet-500 bg-clip-text text-transparent',
  subtitle: 'text-sm text-slate-600 font-medium',
  btnPrimary:
    'px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-400 to-pink-500 text-white font-black text-lg shadow-[0_8px_24px_rgba(255,100,80,0.35)] hover:scale-105 active:scale-95 transition-transform',
  btnOption:
    'w-full py-4 px-5 rounded-2xl bg-white/90 border-2 border-orange-200 text-lg font-bold text-slate-700 hover:border-pink-400 hover:bg-pink-50 hover:scale-[1.02] active:scale-95 transition-all text-start',
  btnGhost:
    'px-4 py-2 rounded-xl bg-white/60 border border-white/80 text-slate-600 hover:bg-white/90 transition-all text-sm font-semibold',
  xpBadge: 'text-4xl font-black text-amber-500 drop-shadow-sm',
  parentCard: 'rounded-3xl p-6 bg-slate-50/90 border border-slate-200/80 shadow-sm',
  parentTitle: 'text-xl font-bold text-slate-700',
};

export const MOOD_GRADIENTS = {
  idle: 'from-orange-200 via-pink-200 to-sky-200',
  thinking: 'from-violet-300 via-indigo-200 to-blue-200',
  challenge: 'from-amber-200 via-orange-300 to-yellow-200',
  celebrate: 'from-yellow-200 via-amber-300 to-orange-400',
};

export const MOOD_GLOW = {
  idle: 'rgba(255, 140, 100, 0.25)',
  thinking: 'rgba(139, 92, 246, 0.35)',
  challenge: 'rgba(251, 191, 36, 0.4)',
  celebrate: 'rgba(255, 215, 0, 0.55)',
};

export const TRACK_ACADEMY_COLORS = {
  arabic: 'from-emerald-400 to-teal-300 border-emerald-300',
  math: 'from-amber-400 to-orange-300 border-amber-300',
  english: 'from-sky-400 to-blue-300 border-sky-300',
  brain: 'from-violet-400 to-purple-300 border-violet-300',
};

export const TRACK_EMOJI = {
  arabic: '📖',
  math: '🔢',
  english: '🌍',
  brain: '🧠',
};
````

## File: src/lib/academyVoice.js
````javascript
/**
 * Academy Voice — child-friendly hybrid TTS (Web Speech + optional cloud).
 * Separate from sovereignVoice (supervisor commands).
 */

import { isSpeechSynthesisSupported } from './sovereignVoice';

const CHILD_RATE = 0.92;
const CHILD_PITCH = 1.15;

const ENCOURAGEMENT_SCRIPTS = {
  ar: [
    'رائع! استمر يا بطل!',
    'واو! أنت نجم حقيقي!',
    'ههه! هذا ممتع جداً!',
    'عقلك يتألق! هيا للتالي!',
    'مغامرة رائعة! أحببتها!',
  ],
  en: [
    'Awesome! Keep going, hero!',
    'Wow! You are a real star!',
    'Haha! That was so fun!',
    'Your mind shines! Next one!',
    'Great adventure! I loved it!',
  ],
};

const WELCOME_SCRIPTS = {
  ar: (name) => `مرحباً ${name}! أنا نورا! جاهز للمغامرة؟`,
  en: (name) => `Hi ${name}! I am Nova! Ready for adventure?`,
};

const TASK_COMPLETE_SCRIPTS = {
  ar: 'بطل! كسبت نقاط جهد! هيا للمزيد!',
  en: 'Hero! You earned effort points! Let us go for more!',
};

const WHEEL_SCRIPTS = {
  ar: 'هيا ندوّر العجلة! أي مسار اليوم؟',
  en: 'Let us spin the wheel! Which track today?',
};

const ASSESSMENT_DONE_SCRIPTS = {
  ar: 'أنت جاهز لبدء المغامرة! هيا ننطلق!',
  en: 'You are ready for the adventure! Let us go!',
};

let speechQueue = [];
let speaking = false;
let unlocked = false;
let currentAudio = null;

export function unlockAcademyVoice() {
  unlocked = true;
}

export function isAcademyVoiceUnlocked() {
  return unlocked;
}

function speechLang(lang) {
  return lang === 'en' ? 'en-US' : 'ar-SA';
}

function pickChildVoice(lang) {
  if (!isSpeechSynthesisSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  const target = speechLang(lang);
  const preferred = voices.find(
    (v) =>
      v.lang.startsWith(target.slice(0, 2)) &&
      (/female|child|zira|hoda|google.*arabic|microsoft.*arabic/i.test(v.name) || v.default)
  );
  return (
    preferred ??
    voices.find((v) => v.lang.startsWith(target.slice(0, 2))) ??
    voices.find((v) => v.default) ??
    voices[0] ??
    null
  );
}

function processQueue(onStart, onEnd) {
  if (speaking || speechQueue.length === 0) return;
  const item = speechQueue.shift();
  speaking = true;
  onStart?.();

  const finish = () => {
    speaking = false;
    onEnd?.();
    processQueue(onStart, onEnd);
  };

  if (item.type === 'cloud') {
    playCloudAudio(item.url)
      .then(finish)
      .catch(() => speakWeb(item.text, item.lang, finish));
    return;
  }

  speakWeb(item.text, item.lang, finish);
}

function speakWeb(text, lang, onDone) {
  if (!isSpeechSynthesisSupported() || !text) {
    onDone?.();
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(String(text));
  utter.lang = speechLang(lang);
  utter.rate = CHILD_RATE;
  utter.pitch = CHILD_PITCH;
  const voice = pickChildVoice(lang);
  if (voice) utter.voice = voice;
  utter.onend = () => onDone?.();
  utter.onerror = () => onDone?.();
  window.speechSynthesis.speak(utter);
}

async function playCloudAudio(url) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  return new Promise((resolve, reject) => {
    const audio = new Audio(url);
    currentAudio = audio;
    audio.onended = () => {
      currentAudio = null;
      resolve();
    };
    audio.onerror = () => {
      currentAudio = null;
      reject(new Error('Cloud TTS playback failed'));
    };
    audio.play().catch(reject);
  });
}

async function fetchCloudTts(text, lang) {
  try {
    const res = await fetch('/api/academy/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'audio/mpeg,audio/*' },
      body: JSON.stringify({ text, lang }),
    });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.size) return null;
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

export function cancelAcademySpeech() {
  speechQueue = [];
  speaking = false;
  if (isSpeechSynthesisSupported()) window.speechSynthesis.cancel();
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
}

export async function enqueueAcademySpeech(text, { lang = 'ar', preferCloud = true, onStart, onEnd } = {}) {
  if (!text || !unlocked) return;

  if (preferCloud) {
    const url = await fetchCloudTts(text, lang);
    if (url) {
      speechQueue.push({ type: 'cloud', url, text, lang });
      processQueue(onStart, onEnd);
      return;
    }
  }

  speechQueue.push({ type: 'web', text, lang });
  processQueue(onStart, onEnd);
}

export function scriptWelcome(name, lang) {
  const fn = WELCOME_SCRIPTS[lang] ?? WELCOME_SCRIPTS.ar;
  return fn(name || (lang === 'en' ? 'Explorer' : 'مغامر'));
}

export function scriptEncouragement(lang) {
  const list = ENCOURAGEMENT_SCRIPTS[lang] ?? ENCOURAGEMENT_SCRIPTS.ar;
  return list[Math.floor(Math.random() * list.length)];
}

export function scriptTaskComplete(lang) {
  return TASK_COMPLETE_SCRIPTS[lang] ?? TASK_COMPLETE_SCRIPTS.ar;
}

export function scriptWheelSpin(lang) {
  return WHEEL_SCRIPTS[lang] ?? WHEEL_SCRIPTS.ar;
}

export function scriptAssessmentDone(lang) {
  return ASSESSMENT_DONE_SCRIPTS[lang] ?? ASSESSMENT_DONE_SCRIPTS.ar;
}

if (typeof window !== 'undefined' && isSpeechSynthesisSupported()) {
  window.speechSynthesis.onvoiceschanged = () => pickChildVoice('ar');
}
````

## File: src/lib/activationCodes.js
````javascript
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
````

## File: src/lib/biometricMatch.js
````javascript
import * as faceapi from "@vladmandic/face-api";
import { getField } from "./airtable";
import { STUDENT as SF } from "./airtableFields";
import { isMasterBypassActive } from "./sovereignMasterBypass";

const MODEL_URL = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/";
const DEFAULT_MATCH_DISTANCE = 0.6;

export const SOVEREIGN_MATCH_CONFIDENCE = 94.7;
/** Same-session enrollment verify — lighting/angle differ from capture. */
export const ENROLLMENT_MATCH_CONFIDENCE = 82;
/** Anti-spoof: minimum similarity to treat as duplicate identity across registry. */
export const ANTI_SPOOF_DUPLICATE_CONFIDENCE = SOVEREIGN_MATCH_CONFIDENCE;

export const FACE_DUPLICATE_BLOCKED = 'FACE_DUPLICATE_BLOCKED';

let modelsLoaded = false;

export async function ensureBiometricModels() {
  if (modelsLoaded) return;
  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ]);
  modelsLoaded = true;
}

/** Parse Airtable face biometric — JSON array or comma-separated 128 floats. */
export function parseFaceDescriptor(raw) {
  if (raw == null || raw === "") return null;

  try {
    if (typeof raw === "string") {
      const trimmed = raw.trim();
      if (trimmed.startsWith("[")) {
        const arr = JSON.parse(trimmed);
        if (Array.isArray(arr) && arr.length === 128) {
          return new Float32Array(arr);
        }
      }
      const parts = trimmed.split(",").map((v) => Number(v.trim()));
      if (parts.length === 128 && parts.every(Number.isFinite)) {
        return new Float32Array(parts);
      }
    }
    if (Array.isArray(raw) && raw.length === 128) {
      return new Float32Array(raw);
    }
  } catch {
    return null;
  }

  return null;
}

export function descriptorToJson(descriptor) {
  if (!descriptor) return "";
  return JSON.stringify(Array.from(descriptor));
}

export function distanceToSimilarityPercent(distance, maxDistance = DEFAULT_MATCH_DISTANCE) {
  if (!Number.isFinite(distance)) return 0;
  const pct = (1 - distance / maxDistance) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function meetsSovereignThreshold(similarityPercent) {
  return similarityPercent >= SOVEREIGN_MATCH_CONFIDENCE;
}

/** Compare live scan to a known reference (enrollment verify). */
export function matchLiveToReference(
  liveDescriptor,
  referenceRaw,
  minConfidence = ENROLLMENT_MATCH_CONFIDENCE
) {
  const enrolled =
    referenceRaw instanceof Float32Array ? referenceRaw : parseFaceDescriptor(referenceRaw);
  if (!liveDescriptor || !enrolled) return null;
  const distance = faceapi.euclideanDistance(liveDescriptor, enrolled);
  const similarityPercent = distanceToSimilarityPercent(distance);
  if (similarityPercent < minConfidence) {
    return { distance, similarityPercent, matched: false };
  }
  return { distance, similarityPercent, matched: true };
}

export function getStudentFaceDescriptor(student) {
  const f = student?.fields ?? {};
  const raw =
    student?.faceBiometric ??
    getField(f, SF.face_biometric) ??
    null;
  return parseFaceDescriptor(raw);
}

/** Resolve Airtable record id or Student_ID code to a student row. */
export function resolveStudentByIdentifier(students, identifier) {
  if (!identifier || !Array.isArray(students)) return null;
  const key = String(identifier).trim();
  if (!key) return null;
  return (
    students.find((s) => s?.id === key) ||
    students.find((s) => String(s?.studentCode ?? "").trim() === key) ||
    students.find((s) => {
      const raw =
        s?.studentCode ??
        getField(s?.fields, SF.id);
      return raw != null && String(raw).trim() === key;
    }) ||
    null
  );
}

function matchDescriptorToStudent(student, liveDescriptor) {
  const enrolled = getStudentFaceDescriptor(student);
  if (!enrolled) return null;
  const distance = faceapi.euclideanDistance(liveDescriptor, enrolled);
  const similarityPercent = distanceToSimilarityPercent(distance);
  if (!meetsSovereignThreshold(similarityPercent)) return null;
  return { student, distance, similarityPercent };
}

/**
 * Match live descriptor against enrolled students.
 * Returns match only when sovereign confidence (≥94.7%) is met.
 */
export function matchStudentByFaceDescriptor(students, liveDescriptor, selectedStudentId = null) {
  if (!liveDescriptor || !Array.isArray(students) || students.length === 0) return null;

  if (selectedStudentId) {
    const target = resolveStudentByIdentifier(students, selectedStudentId);
    if (!target) return null;
    return matchDescriptorToStudent(target, liveDescriptor);
  }

  let bestStudent = null;
  let bestDistance = Infinity;

  for (const student of students) {
    const enrolled = getStudentFaceDescriptor(student);
    if (!enrolled) continue;

    const distance = faceapi.euclideanDistance(liveDescriptor, enrolled);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestStudent = student;
    }
  }

  if (!bestStudent) return null;

  const similarityPercent = distanceToSimilarityPercent(bestDistance);
  if (!meetsSovereignThreshold(similarityPercent)) return null;

  return { student: bestStudent, distance: bestDistance, similarityPercent };
}

/**
 * Scan entire student registry for a duplicate face (anti-spoof / anti multi-enrollment).
 * Returns the first conflicting student at or above sovereign threshold.
 */
export function findDuplicateFaceInRegistry(students, liveDescriptor, excludeStudentId = null) {
  if (!liveDescriptor || !Array.isArray(students)) return null;

  let best = null;

  for (const student of students) {
    if (excludeStudentId && student?.id === excludeStudentId) continue;
    const enrolled = getStudentFaceDescriptor(student);
    if (!enrolled) continue;

    const distance = faceapi.euclideanDistance(liveDescriptor, enrolled);
    const similarityPercent = distanceToSimilarityPercent(distance);
    if (similarityPercent < ANTI_SPOOF_DUPLICATE_CONFIDENCE) continue;

    if (!best || similarityPercent > best.similarityPercent) {
      best = { student, distance, similarityPercent };
    }
  }

  return best;
}

/** Throws FACE_DUPLICATE_BLOCKED if live face matches another student in Airtable. */
export function assertFaceUniqueInRegistry(students, liveDescriptor, excludeStudentId = null, lang = 'ar') {
  if (isMasterBypassActive()) return;

  const dup = findDuplicateFaceInRegistry(students, liveDescriptor, excludeStudentId);
  if (!dup) return;

  const name = dup.student?.name ?? dup.student?.id ?? '—';
  const msg =
    lang === 'en'
      ? `Registration denied — this face is already registered to "${name}" (${dup.similarityPercent.toFixed(1)}% match). Operation blocked.`
      : `رفض التسجيل — هذا الوجه مسجّل مسبقاً للطالب «${name}» (تطابق ${dup.similarityPercent.toFixed(1)}%). تم حظر العملية لمنع التحايل.`;

  const err = new Error(msg);
  err.code = FACE_DUPLICATE_BLOCKED;
  err.duplicateStudent = dup.student;
  err.similarityPercent = dup.similarityPercent;
  throw err;
}

export function studentHasFaceBiometric(student) {
  const raw = student?.faceBiometric ?? getField(student?.fields, SF.face_biometric);
  return raw != null && String(raw).trim().length > 8;
}

export async function detectFaceDescriptor(videoEl, minDetectionScore = 0.5) {
  if (!videoEl) return null;

  const result = await faceapi
    .detectSingleFace(
      videoEl,
      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.3 })
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!result?.descriptor) return null;
  if ((result.detection?.score ?? 0) < minDetectionScore) return null;

  return {
    descriptor: result.descriptor,
    score: result.detection.score,
  };
}

/** Average several stable frames into one enrollment descriptor. */
export async function captureStableDescriptor(videoEl, { samples = 5, minScore = 0.5, maxAttempts = 30 } = {}) {
  const vectors = [];
  for (let attempt = 0; attempt < maxAttempts && vectors.length < samples; attempt += 1) {
    const face = await detectFaceDescriptor(videoEl, minScore);
    if (face?.descriptor) vectors.push(face.descriptor);
    await new Promise((r) => setTimeout(r, 120));
  }
  if (vectors.length < samples) return null;

  const avg = new Float32Array(128);
  for (let j = 0; j < 128; j += 1) {
    avg[j] = vectors.reduce((sum, v) => sum + v[j], 0) / vectors.length;
  }

  return { descriptor: avg, samples: vectors.length };
}
````

## File: src/lib/childSessionSeal.js
````javascript
/**
 * Child Island → tblDailySessions seal bridge (AUN-4611 fairness trigger).
 * Server-only — direct Airtable REST (no browser airtable.js import).
 */

import { createHash } from 'crypto';
import { DAILY_SESSION as DS } from './airtableFields.js';
import { airtableConfigFromEnv, sanitizeAscii } from './paymentActivation.js';

export const CHILD_ISLAND_SEAL_THRESHOLD = 5;
export const ISLAND_SEAL_MARKER = 'AUN-4611 · Island World';
const CLAIM_STATUS_SEALED = 'Sealed';

function dailySessionsTableId() {
  return (
    sanitizeAscii(process.env.AIRTABLE_DAILY_SESSIONS_TABLE_ID) ||
    sanitizeAscii(process.env.VITE_AIRTABLE_DAILY_SESSIONS_TABLE_ID) ||
    'tbl3mlewMLvqp6AXB'
  );
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function hashChildIslandSeal(payload) {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

function airtableHeaders(apiKey) {
  return { Authorization: `Bearer ${sanitizeAscii(apiKey)}`, Accept: 'application/json' };
}

function sealedClaimsFormula(studentName, day) {
  const name = String(studentName).replace(/'/g, "\\'");
  return `AND({${DS.student_name}}='${name}',{${DS.claim_status}}='${CLAIM_STATUS_SEALED}',{${DS.session_date}}='${day}')`;
}

async function fetchSealedClaimsForDay(apiKey, baseId, studentName, day) {
  const tableId = dailySessionsTableId();
  const formula = encodeURIComponent(sealedClaimsFormula(studentName, day));
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}?filterByFormula=${formula}`;
  const res = await fetch(url, { headers: airtableHeaders(apiKey) });
  if (!res.ok) return [];
  const data = await res.json();
  return data.records ?? [];
}

async function postSealedClaim(apiKey, baseId, fields) {
  const tableId = dailySessionsTableId();
  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { ...airtableHeaders(apiKey), 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields, typecast: true }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(text.slice(0, 300) || 'AIRTABLE_POST_FAILED');
  return JSON.parse(text);
}

/** True if student already has a child-island sealed claim today. */
export async function hasChildIslandSealToday(studentName, config = airtableConfigFromEnv()) {
  const { apiKey, baseId } = config;
  if (!apiKey) return false;
  const day = todayIsoDate();
  const claims = await fetchSealedClaimsForDay(apiKey, baseId, studentName, day);
  return claims.some((row) => String(row?.fields?.[DS.notes] ?? '').includes(ISLAND_SEAL_MARKER));
}

/**
 * Seal daily session when child completes meaningful island interaction.
 * Idempotent: one island seal per student per calendar day.
 */
export async function sealSessionFromChildIsland({
  studentId,
  studentName,
  interactionCount = CHILD_ISLAND_SEAL_THRESHOLD,
  source = 'island_world',
  interactionType = 'play_engagement',
  config = airtableConfigFromEnv(),
}) {
  const name = String(studentName ?? '').trim();
  if (!name) throw new Error('STUDENT_NAME_REQUIRED');

  const { apiKey, baseId } = config;
  if (!apiKey) throw new Error('AIRTABLE_NOT_CONFIGURED');

  const day = todayIsoDate();
  if (await hasChildIslandSealToday(name, config)) {
    return { ok: true, alreadySealed: true, sessionDate: day };
  }

  const allToday = await fetchSealedClaimsForDay(apiKey, baseId, name, day);
  const sequence = allToday.length + 1;

  const attestationPayload = {
    trigger: 'CHILD_ISLAND',
    engine: 'AUN-4611',
    studentId: studentId ?? null,
    studentName: name,
    interactionCount,
    source,
    interactionType,
    sessionDate: day,
    sealedAt: new Date().toISOString(),
  };

  const signature = {
    method: 'CHILD_ISLAND_BRIDGE',
    payload: attestationPayload,
    signature: hashChildIslandSeal(attestationPayload).slice(0, 32),
  };
  const immutableHash = hashChildIslandSeal({ attestationPayload, signature });
  const notes = `${ISLAND_SEAL_MARKER} · ${source} · ${interactionType} · ${interactionCount} interactions · child verified`;

  const fields = {
    [DS.session_date]: day,
    [DS.specialist_name]: 'Aunak · Island Bridge',
    [DS.student_name]: name,
    [DS.notes]: notes,
    [DS.claim_status]: CLAIM_STATUS_SEALED,
    [DS.sealed_at]: new Date().toISOString(),
    [DS.session_sequence]: sequence,
    [DS.immutable_hash]: immutableHash,
    [DS.pin_verified]: false,
    [DS.specialist_signature]: JSON.stringify(signature),
  };

  const row = await postSealedClaim(apiKey, baseId, fields);

  return {
    ok: true,
    alreadySealed: false,
    sealed: true,
    sessionDate: day,
    sequence,
    claimId: row?.id ?? null,
    immutableHash,
  };
}
````

## File: src/lib/childTheme.js
````javascript
/** Child interactive shell — bright, lock-free play theme. */

export const CHILD = {
  root: 'child-play-root min-h-screen text-slate-800 font-sans overflow-hidden select-none',
  sky:
    'pointer-events-none fixed inset-0 bg-gradient-to-b from-sky-300 via-pink-100 to-amber-100',
  bubbles:
    'pointer-events-none fixed inset-0 opacity-40 bg-[radial-gradient(circle_at_20%_30%,rgba(255,255,255,0.9)_0%,transparent_35%),radial-gradient(circle_at_80%_70%,rgba(255,200,100,0.6)_0%,transparent_40%)]',
  header:
    'relative z-20 px-4 py-3 flex items-center justify-between bg-white/50 backdrop-blur-md border-b border-white/60',
  main: 'relative z-10 max-w-lg mx-auto p-4 pb-24',
  card: 'rounded-[2rem] p-6 bg-white/85 backdrop-blur-xl border-4 border-white shadow-[0_12px_40px_rgba(255,150,100,0.25)]',
  title: 'text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-orange-500 to-pink-500',
  subtitle: 'text-base font-bold text-slate-600',
  btnPlay:
    'w-full py-5 rounded-[1.5rem] text-xl font-black text-white bg-gradient-to-r from-emerald-400 to-teal-400 shadow-[0_8px_0_#0d9488] active:shadow-none active:translate-y-2 transition-all',
  btnBubble:
    'absolute rounded-full font-black text-white shadow-lg active:scale-90 transition-transform cursor-pointer border-4 border-white/80',
  mascotWrap: 'flex flex-col items-center gap-3',
  mascotFace:
    'w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 to-orange-400 border-4 border-white shadow-xl flex items-center justify-center text-5xl animate-[child-bounce_2s_ease-in-out_infinite]',
  speech:
    'max-w-xs text-center px-5 py-3 rounded-3xl bg-white border-4 border-amber-200 text-lg font-bold text-amber-800 shadow-md',
};

export const CHILD_GREETINGS = {
  ar: [
    'مرحباً يا بطل! أنا عوني 🌟',
    'يلا نلعب ونتعلّم!',
    'أنت رائع! استمر!',
    'يا سلام! إجابة صح!',
  ],
  en: ['Hi champion! I am Awni 🌟', "Let's play and learn!", 'You are amazing!', 'Wow! Correct!'],
};

export const BUBBLE_COLORS = [
  'from-pink-400 to-rose-400',
  'from-sky-400 to-blue-400',
  'from-amber-400 to-orange-400',
  'from-emerald-400 to-teal-400',
  'from-violet-400 to-purple-400',
];
````

## File: src/lib/countryDialCodes.js
````javascript
/**
 * Country dial codes for enrollment — add countries here for stats / marketing geo.
 */

export const COUNTRY_DIAL_CODES = [
  { iso: 'SA', flag: '🇸🇦', dial: '966', ar: 'السعودية', en: 'Saudi Arabia', nationalLength: 9, mobileStarts: ['5'] },
  { iso: 'AE', flag: '🇦🇪', dial: '971', ar: 'الإمارات', en: 'UAE', nationalLength: 9, mobileStarts: ['5'] },
  { iso: 'OM', flag: '🇴🇲', dial: '968', ar: 'عُمان', en: 'Oman', nationalLength: 8, mobileStarts: ['7', '9'] },
  { iso: 'KW', flag: '🇰🇼', dial: '965', ar: 'الكويت', en: 'Kuwait', nationalLength: 8, mobileStarts: ['5', '6', '9'] },
  { iso: 'QA', flag: '🇶🇦', dial: '974', ar: 'قطر', en: 'Qatar', nationalLength: 8, mobileStarts: ['3', '5', '6', '7'] },
  { iso: 'BH', flag: '🇧🇭', dial: '973', ar: 'البحرين', en: 'Bahrain', nationalLength: 8, mobileStarts: ['3'] },
  { iso: 'EG', flag: '🇪🇬', dial: '20', ar: 'مصر', en: 'Egypt', nationalLength: 10, mobileStarts: ['1'] },
  { iso: 'JO', flag: '🇯🇴', dial: '962', ar: 'الأردن', en: 'Jordan', nationalLength: 9, mobileStarts: ['7'] },
  { iso: 'LB', flag: '🇱🇧', dial: '961', ar: 'لبنان', en: 'Lebanon', nationalLength: 8, mobileStarts: ['3', '7'] },
  { iso: 'IQ', flag: '🇮🇶', dial: '964', ar: 'العراق', en: 'Iraq', nationalLength: 10, mobileStarts: ['7'] },
  { iso: 'YE', flag: '🇾🇪', dial: '967', ar: 'اليمن', en: 'Yemen', nationalLength: 9, mobileStarts: ['7'] },
  { iso: 'PS', flag: '🇵🇸', dial: '970', ar: 'فلسطين', en: 'Palestine', nationalLength: 9, mobileStarts: ['5'] },
  { iso: 'MA', flag: '🇲🇦', dial: '212', ar: 'المغرب', en: 'Morocco', nationalLength: 9, mobileStarts: ['6', '7'] },
  { iso: 'DZ', flag: '🇩🇿', dial: '213', ar: 'الجزائر', en: 'Algeria', nationalLength: 9, mobileStarts: ['5', '6', '7'] },
  { iso: 'TN', flag: '🇹🇳', dial: '216', ar: 'تونس', en: 'Tunisia', nationalLength: 8, mobileStarts: ['2', '4', '5', '9'] },
];

export const DEFAULT_COUNTRY_ISO = 'SA';

export function getCountryByIso(iso) {
  return COUNTRY_DIAL_CODES.find((c) => c.iso === iso) ?? COUNTRY_DIAL_CODES[0];
}

export function getCountryOptions(lang = 'ar') {
  return COUNTRY_DIAL_CODES.map((c) => ({
    ...c,
    label: `${c.flag} +${c.dial} ${lang === 'en' ? c.en : c.ar}`,
  }));
}

/** Strip leading 0 from national input; return E.164 digits without + */
export function formatPhoneE164(countryIso, nationalRaw) {
  const country = getCountryByIso(countryIso);
  let national = String(nationalRaw ?? '').replace(/\D/g, '');
  if (national.startsWith('0')) national = national.slice(1);
  return `${country.dial}${national}`;
}

export function formatPhoneDisplay(countryIso, nationalRaw) {
  const e164 = formatPhoneE164(countryIso, nationalRaw);
  return `+${e164}`;
}
````

## File: src/lib/diagnosisOptions.js
````javascript
/**
 * Approved diagnosis catalog — enrollment dropdown reads from here only.
 * `airtableValue` must match Students.diagnosis Single select in Airtable.
 */

export const DIAGNOSIS_OPTIONS = [
  { id: 'autism_spectrum', airtableValue: 'autism_spectrum', ar: 'طيف التوحد', en: 'Autism spectrum' },
  { id: 'adhd', airtableValue: 'adhd', ar: 'تشتت انتباه وفرط حركة', en: 'ADHD' },
  { id: 'learning_difficulty', airtableValue: 'learning_difficulty', ar: 'صعوبات تعلم', en: 'Learning difficulties' },
  { id: 'language_delay', airtableValue: 'language_delay', ar: 'تأخر لغوي', en: 'Language delay' },
  { id: 'under_assessment', airtableValue: 'under_assessment', ar: 'قيد التقييم', en: 'Under assessment' },
];

export function getDiagnosisOptions(lang = 'ar') {
  return DIAGNOSIS_OPTIONS.map((o) => ({
    ...o,
    label: lang === 'en' ? o.en : o.ar,
  }));
}

export function diagnosisLabel(value, lang = 'ar') {
  const hit = DIAGNOSIS_OPTIONS.find((o) => o.airtableValue === String(value ?? '').trim());
  if (!hit) return String(value ?? '').trim() || '—';
  return lang === 'en' ? hit.en : hit.ar;
}

export function isValidDiagnosis(value) {
  const key = String(value ?? '').trim();
  return DIAGNOSIS_OPTIONS.some((o) => o.airtableValue === key);
}
````

## File: src/lib/enrollmentLink.js
````javascript
export const ENROLL_QUERY = 'enroll';

const TRUTHY = new Set(['1', 'true', 'yes']);

function getSearchString(search) {
  if (search !== undefined) return search.startsWith('?') ? search : search ? `?${search}` : '';
  if (typeof window === 'undefined') return '';
  return window.location.search;
}

export function isEnrollmentDeepLink(search) {
  const raw = getSearchString(search);
  const params = new URLSearchParams(raw.startsWith('?') ? raw.slice(1) : raw);
  const value = params.get(ENROLL_QUERY);
  if (value == null) return false;
  return TRUTHY.has(String(value).trim().toLowerCase());
}

export function buildEnrollmentUrl(origin) {
  const base = (origin ?? (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '');
  return `${base}/?${ENROLL_QUERY}=1`;
}

export function setEnrollmentUrl(active) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (active) url.searchParams.set(ENROLL_QUERY, '1');
  else url.searchParams.delete(ENROLL_QUERY);
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState(window.history.state, '', next);
}
````

## File: src/lib/enrollmentValidation.js
````javascript
/**
 * Strict sovereign enrollment validation — step 1 gate (100% before assessment).
 */

import { getCountryByIso, formatPhoneDisplay, formatPhoneE164, getCountryOptions, DEFAULT_COUNTRY_ISO } from './countryDialCodes';
import { isValidDiagnosis } from './diagnosisOptions';

export const ENROLLMENT_AGE_MIN = 2;
export const ENROLLMENT_AGE_MAX = 18;

const NAME_GIBBERISH = /^(test|fake|dummy|asdf|qwerty|abc|xyz|none|na|null|undefined|طفل|اسم|ولد|بنت|student|child)$/i;
const NAME_PART_MIN = 2;
const NAME_PART_MAX = 40;

function msg(lang, ar, en) {
  return lang === 'en' ? en : ar;
}

/** At least two name parts (first + family), letters only, no gibberish. */
export function validateStudentName(raw, lang = 'ar') {
  const trimmed = String(raw ?? '')
    .trim()
    .replace(/\s+/g, ' ');

  if (!trimmed) {
    return {
      ok: false,
      code: 'NAME_EMPTY',
      message: msg(lang, 'أدخل اسم الطالب كاملاً', 'Enter the student full name'),
    };
  }

  if (trimmed.length < 5) {
    return {
      ok: false,
      code: 'NAME_TOO_SHORT',
      message: msg(
        lang,
        'الاسم قصير جداً — أدخل الاسم الأول واللقب',
        'Name too short — enter first and last name'
      ),
    };
  }

  if (!/^[\p{L}][\p{L}\s'-]*[\p{L}]$/u.test(trimmed) && !/^[\p{L}]{2,}$/u.test(trimmed)) {
    return {
      ok: false,
      code: 'NAME_FORMAT',
      message: msg(
        lang,
        'الاسم يجب أن يحتوي على حروف فقط (بدون أرقام أو رموز)',
        'Name must contain letters only (no numbers or symbols)'
      ),
    };
  }

  if (/[\d#@$%^&*()+=[\]{}|\\/<>~`"]/.test(trimmed)) {
    return {
      ok: false,
      code: 'NAME_SYMBOLS',
      message: msg(
        lang,
        'يُمنع استخدام الرموز أو الأرقام في اسم الطالب',
        'Numbers and symbols are not allowed in the student name'
      ),
    };
  }

  const parts = trimmed.split(/\s+/).filter(Boolean);
  const validParts = parts.filter((p) => {
    const clean = p.replace(/[-']/g, '');
    return clean.length >= NAME_PART_MIN && clean.length <= NAME_PART_MAX && /^[\p{L}]+$/u.test(clean);
  });

  if (validParts.length < 2) {
    return {
      ok: false,
      code: 'NAME_TWO_PARTS',
      message: msg(
        lang,
        'يجب إدخال اسمين على الأقل: الاسم الأول + اللقب (مثل: محمد علي)',
        'Enter at least two names: first name + family name (e.g. Mohamed Ali)'
      ),
    };
  }

  for (const part of validParts) {
    const core = part.replace(/[-']/g, '');
    if (NAME_GIBBERISH.test(core)) {
      return {
        ok: false,
        code: 'NAME_GIBBERISH',
        message: msg(
          lang,
          'الاسم المدخل غير مقبول — استخدم الاسم الحقيقي للطفل',
          'Invalid name — use the child real name'
        ),
      };
    }
    if (/^(.)\1{2,}$/u.test(core)) {
      return {
        ok: false,
        code: 'NAME_REPEAT',
        message: msg(
          lang,
          'الاسم يبدو عشوائياً — أدخل اسماً حقيقياً',
          'Name appears random — enter a real name'
        ),
      };
    }
  }

  return { ok: true, normalized: validParts.join(' ') };
}

/** Platform eligibility: 2–18 years inclusive. */
export function validateEnrollmentAge(raw, lang = 'ar') {
  const s = String(raw ?? '').trim();
  if (!s) {
    return {
      ok: false,
      code: 'AGE_EMPTY',
      message: msg(lang, 'أدخل عمر الطفل', 'Enter the child age'),
    };
  }

  if (!/^\d{1,2}$/.test(s)) {
    return {
      ok: false,
      code: 'AGE_FORMAT',
      message: msg(lang, 'العمر يجب أن يكون رقماً صحيحاً', 'Age must be a whole number'),
    };
  }

  const n = Number(s);
  if (!Number.isInteger(n)) {
    return {
      ok: false,
      code: 'AGE_FORMAT',
      message: msg(lang, 'العمر يجب أن يكون رقماً صحيحاً', 'Age must be a whole number'),
    };
  }

  if (n < ENROLLMENT_AGE_MIN || n > ENROLLMENT_AGE_MAX) {
    return {
      ok: false,
      code: 'AGE_RANGE',
      message: msg(
        lang,
        `العمر يجب أن يكون بين ${ENROLLMENT_AGE_MIN} و ${ENROLLMENT_AGE_MAX} سنة — النطاق التأهيلي للمنصة`,
        `Age must be between ${ENROLLMENT_AGE_MIN} and ${ENROLLMENT_AGE_MAX} — platform eligibility range`
      ),
    };
  }

  return { ok: true, value: n };
}

export function validateDiagnosis(raw, lang = 'ar') {
  const key = String(raw ?? '').trim();
  if (!key) {
    return {
      ok: false,
      code: 'DIAGNOSIS_EMPTY',
      message: msg(lang, 'اختر التشخيص من القائمة', 'Select a diagnosis from the list'),
    };
  }
  if (!isValidDiagnosis(key)) {
    return {
      ok: false,
      code: 'DIAGNOSIS_INVALID',
      message: msg(lang, 'التشخيص المختار غير صالح', 'Selected diagnosis is invalid'),
    };
  }
  return { ok: true, value: key };
}

function isAllSameDigit(digits) {
  return /^(\d)\1+$/.test(digits);
}

function isTrivialSequence(digits) {
  if (digits.length < 6) return false;
  const seqs = ['0123456789', '1234567890', '9876543210', '0987654321'];
  return seqs.some((s) => s.includes(digits) || digits.includes(s.slice(0, digits.length)));
}

function isMonotonicRun(digits) {
  if (digits.length < 6) return false;
  let asc = true;
  let desc = true;
  for (let i = 1; i < digits.length; i += 1) {
    const a = Number(digits[i - 1]);
    const b = Number(digits[i]);
    if (b !== a + 1) asc = false;
    if (b !== a - 1) desc = false;
  }
  return asc || desc;
}

/** Country-aware mobile — national number + ISO country. */
export function validateParentPhone(nationalRaw, countryIso, lang = 'ar') {
  const country = getCountryByIso(countryIso);
  let national = String(nationalRaw ?? '').replace(/\D/g, '');
  if (national.startsWith('0')) national = national.slice(1);

  if (!national) {
    return {
      ok: false,
      code: 'PHONE_EMPTY',
      message: msg(lang, 'أدخل رقم هاتف ولي الأمر', 'Enter guardian phone number'),
    };
  }

  if (isAllSameDigit(national) || isTrivialSequence(national) || isMonotonicRun(national)) {
    return {
      ok: false,
      code: 'PHONE_FAKE',
      message: msg(
        lang,
        'رقم الهاتف غير واقعي — أدخل رقم جوال فعّال',
        'Phone number looks invalid — enter a real mobile number'
      ),
    };
  }

  const lenOk =
    national.length === country.nationalLength ||
    (country.nationalLength >= 8 && national.length >= country.nationalLength - 1 && national.length <= country.nationalLength + 1);

  if (!lenOk) {
    return {
      ok: false,
      code: 'PHONE_LENGTH',
      message: msg(
        lang,
        `رقم الجوال في ${country.ar} عادة ${country.nationalLength} أرقام (بدون كود الدولة)`,
        `Mobile in ${country.en} is typically ${country.nationalLength} digits (without country code)`
      ),
    };
  }

  if (country.mobileStarts?.length && !country.mobileStarts.some((p) => national.startsWith(p))) {
    return {
      ok: false,
      code: 'PHONE_FORMAT',
      message: msg(
        lang,
        'صيغة رقم الجوال غير صحيحة لهذا البلد',
        'Mobile number format is invalid for this country'
      ),
    };
  }

  const e164 = formatPhoneE164(countryIso, national);
  return {
    ok: true,
    normalized: e164,
    display: formatPhoneDisplay(countryIso, national),
    countryCode: country.dial,
    national,
  };
}

/** Full step-1 validation — all fields must pass. */
export function validateEnrollmentStep1({
  name,
  age,
  parentPhone,
  countryIso,
  diagnosis,
  lang = 'ar',
}) {
  const errors = {};
  const nameResult = validateStudentName(name, lang);
  const ageResult = validateEnrollmentAge(age, lang);
  const phoneResult = validateParentPhone(parentPhone, countryIso, lang);
  const diagnosisResult = validateDiagnosis(diagnosis, lang);

  if (!nameResult.ok) errors.name = nameResult.message;
  if (!ageResult.ok) errors.age = ageResult.message;
  if (!phoneResult.ok) errors.phone = phoneResult.message;
  if (!diagnosisResult.ok) errors.diagnosis = diagnosisResult.message;

  const ok = nameResult.ok && ageResult.ok && phoneResult.ok && diagnosisResult.ok;

  return {
    ok,
    errors,
    normalized: ok
      ? {
          name: nameResult.normalized,
          age: ageResult.value,
          parentPhone: phoneResult.display,
          parentPhoneE164: phoneResult.normalized,
          parentCountryCode: phoneResult.countryCode,
          diagnosis: diagnosisResult.value,
        }
      : null,
    firstError: errors.name || errors.age || errors.phone || errors.diagnosis || null,
  };
}
````

## File: src/lib/goalEngine.js
````javascript
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
````

## File: src/lib/harmonyEngine.js
````javascript
/**
 * Harmony Score — academic vs behavioral gap with 20% penalty.
 */

import {
  parseHarmonyScore,
  updateStudentRecord,
  getField,
  fetchStudents,
  STUDENT as SF,
} from "./airtable";
import { HARMONY_DEDUCTION_RATE } from "./sovereignProtocol";

export const HARMONY_GAP_THRESHOLD = 20;
export const HARMONY_GAP_PENALTY_RATE = HARMONY_DEDUCTION_RATE;
export const HARMONY_LOGIN_DEDUCTION_RATE = HARMONY_DEDUCTION_RATE;

export function normalize0to100(value) {
  if (value == null || value === "") return null;
  const n = Number(String(value).replace(/%/g, "").trim());
  if (!Number.isFinite(n)) return null;
  if (n <= 1 && n >= 0) return Math.round(n * 100);
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Core harmony: optional base, 20% penalty when academic–behavior gap ≥ 20. */
export function computeHarmonyScore({ academicProgress, behaviorIntensity, baseScore }) {
  const academic = normalize0to100(academicProgress);
  const behavior = normalize0to100(behaviorIntensity);

  let score =
    parseHarmonyScore(baseScore) ??
    (academic != null && behavior != null
      ? Math.round((academic + (100 - behavior)) / 2)
      : academic ?? (behavior != null ? Math.round(100 - behavior) : null));

  if (score == null) return null;

  if (academic != null && behavior != null) {
    const gap = Math.abs(academic - behavior);
    if (gap >= HARMONY_GAP_THRESHOLD) {
      score = Math.round(score * (1 - HARMONY_GAP_PENALTY_RATE));
    }
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
````

## File: src/lib/initialAssessmentEngine.js
````javascript
/**
 * Initial free assessment — parent-facing quick screen (6 domains, ~3 min).
 * Not a clinical diagnosis — actionable preliminary profile for conversion.
 */

export const ASSESSMENT_DOMAINS = [
  'communication',
  'social',
  'behavior',
  'sensory',
  'language',
  'flexibility',
];

export function getAssessmentQuestions(lang = 'ar') {
  const ar = [
    {
      id: 'communication',
      domain: 'communication',
      text: 'هل يتواصل طفلك بالنظرات أو الإشارة لطلب شيء يريده؟',
      options: [
        { label: 'نعم بانتظام وبوضوح', score: 0 },
        { label: 'أحياناً', score: 1 },
        { label: 'نادراً', score: 2 },
        { label: 'لا تقريباً', score: 3 },
      ],
    },
    {
      id: 'social',
      domain: 'social',
      text: 'هل يشارك طفلك الفرح أو يهتم بمشاركة اللعب مع أقرانه؟',
      options: [
        { label: 'نعم بشكل طبيعي', score: 0 },
        { label: 'أحياناً مع التشجيع', score: 1 },
        { label: 'يفضل اللعب وحده غالباً', score: 2 },
        { label: 'يتجنب التفاعل الاجتماعي', score: 3 },
      ],
    },
    {
      id: 'behavior',
      domain: 'behavior',
      text: 'هل لدى طفلك حركات أو أصوات متكررة (رفرفة، دوران، ترتيب الأشياء)؟',
      options: [
        { label: 'لا أو نادراً جداً', score: 0 },
        { label: 'أحياناً تحت التوتر', score: 1 },
        { label: 'متكررة يومياً', score: 2 },
        { label: 'شديدة وتؤثر على يومه', score: 3 },
      ],
    },
    {
      id: 'sensory',
      domain: 'sensory',
      text: 'هل يتأثر طفلك بشدة بالأصوات العالية أو الملمس أو الإضاءة؟',
      options: [
        { label: 'لا يتأثر بشكل ملحوظ', score: 0 },
        { label: 'حساسية خفيفة', score: 1 },
        { label: 'حساسية واضحة', score: 2 },
        { label: 'حساسية شديدة تعطل نشاطه', score: 3 },
      ],
    },
    {
      id: 'language',
      domain: 'language',
      text: 'كيف يعبّر طفلك عن احتياجاته (كلمات، جمل، إيماءات)؟',
      options: [
        { label: 'جمل واضحة لعمره', score: 0 },
        { label: 'كلمات مفردة كافية', score: 1 },
        { label: 'كلمات قليلة أو تأخر', score: 2 },
        { label: 'تواصل غير لفظي فقط', score: 3 },
      ],
    },
    {
      id: 'flexibility',
      domain: 'flexibility',
      text: 'كيف يتعامل طفلك مع تغيير الروتين أو الانتقال بين الأنشطة؟',
      options: [
        { label: 'يتكيف بسهولة', score: 0 },
        { label: 'يحتاج تذكيراً بسيطاً', score: 1 },
        { label: 'يضطرب أو يبكي', score: 2 },
        { label: 'أزمة شديدة عند أي تغيير', score: 3 },
      ],
    },
  ];

  const en = [
    {
      id: 'communication',
      domain: 'communication',
      text: 'Does your child use eye contact or pointing to request what they want?',
      options: [
        { label: 'Yes, regularly and clearly', score: 0 },
        { label: 'Sometimes', score: 1 },
        { label: 'Rarely', score: 2 },
        { label: 'Almost never', score: 3 },
      ],
    },
    {
      id: 'social',
      domain: 'social',
      text: 'Does your child share joy or join peers in play?',
      options: [
        { label: 'Yes, naturally', score: 0 },
        { label: 'Sometimes with encouragement', score: 1 },
        { label: 'Prefers solo play', score: 2 },
        { label: 'Avoids social interaction', score: 3 },
      ],
    },
    {
      id: 'behavior',
      domain: 'behavior',
      text: 'Repetitive movements or sounds (flapping, spinning, lining up items)?',
      options: [
        { label: 'No or very rare', score: 0 },
        { label: 'Sometimes under stress', score: 1 },
        { label: 'Daily repetition', score: 2 },
        { label: 'Severe — affects daily life', score: 3 },
      ],
    },
    {
      id: 'sensory',
      domain: 'sensory',
      text: 'Strong reaction to loud sounds, touch, or light?',
      options: [
        { label: 'Not noticeably', score: 0 },
        { label: 'Mild sensitivity', score: 1 },
        { label: 'Clear sensitivity', score: 2 },
        { label: 'Severe — disrupts activity', score: 3 },
      ],
    },
    {
      id: 'language',
      domain: 'language',
      text: 'How does your child express needs (words, sentences, gestures)?',
      options: [
        { label: 'Clear sentences for age', score: 0 },
        { label: 'Enough single words', score: 1 },
        { label: 'Few words or delay', score: 2 },
        { label: 'Non-verbal only', score: 3 },
      ],
    },
    {
      id: 'flexibility',
      domain: 'flexibility',
      text: 'How does your child handle routine changes or transitions?',
      options: [
        { label: 'Adapts easily', score: 0 },
        { label: 'Needs a simple reminder', score: 1 },
        { label: 'Upset or crying', score: 2 },
        { label: 'Severe meltdown on change', score: 3 },
      ],
    },
  ];

  return lang === 'en' ? en : ar;
}

const DOMAIN_LABELS = {
  ar: {
    communication: 'التواصل',
    social: 'الاجتماعي',
    behavior: 'السلوك',
    sensory: 'الحسي',
    language: 'اللغة',
    flexibility: 'المرونة',
  },
  en: {
    communication: 'Communication',
    social: 'Social',
    behavior: 'Behavior',
    sensory: 'Sensory',
    language: 'Language',
    flexibility: 'Flexibility',
  },
};

/** Compute score 0–100 and profile from answers { questionId: optionScore }. */
export function computeInitialAssessment(answers, lang = 'ar') {
  const questions = getAssessmentQuestions(lang);
  let rawTotal = 0;
  const domainScores = {};

  for (const q of questions) {
    const s = Number(answers[q.id]);
    const score = Number.isFinite(s) ? Math.min(3, Math.max(0, s)) : 0;
    rawTotal += score;
    domainScores[q.domain] = score;
  }

  const maxRaw = questions.length * 3;
  const scorePercent = Math.round((rawTotal / maxRaw) * 100);

  let band = 'balanced';
  if (scorePercent >= 66) band = 'elevated';
  else if (scorePercent >= 36) band = 'moderate';

  const labels = DOMAIN_LABELS[lang] ?? DOMAIN_LABELS.ar;
  const strengths = [];
  const focusAreas = [];

  for (const [domain, s] of Object.entries(domainScores)) {
    if (s <= 1) strengths.push(labels[domain]);
    if (s >= 2) focusAreas.push(labels[domain]);
  }

  const profile = buildProfile({ band, scorePercent, strengths, focusAreas, lang });

  return {
    scorePercent,
    rawTotal,
    band,
    domainScores,
    strengths,
    focusAreas,
    ...profile,
  };
}

function buildProfile({ band, scorePercent, strengths, focusAreas, lang }) {
  const ar = {
    balanced: {
      title: 'ملف متوازن مع فرص نمو واضحة',
      summary:
        'إجاباتك تشير إلى مهارات أساسية جيدة مع مجالات يمكن تعزيزها مبكراً. التدخل الموجّه الآن يختصر شهوراً من التأخير.',
      recommendation: 'نوصي بالتقييم الشامل لرسم خطة تأهيل دقيقة خلال 48 ساعة.',
    },
    moderate: {
      title: 'إشارات تستحق متابعة مركّزة',
      summary:
        'النتيجة المبدئية تُظهر أنماطاً تحتاج دعماً منهجياً في أكثر من مجال. كل أسبوع تأخير يقلّل فرص التقدم السريع.',
      recommendation: 'التقييم الشامل الكامل ضروري — يكشف نقاط القوة المخفية ويحدد أولويات الجلسات.',
    },
    elevated: {
      title: 'أولوية عالية — خطوة فورية مطلوبة',
      summary:
        'الإجابات تعكس احتياجاً واضحاً لتدخل مبكر مكثّف. البيانات السيادية لعونك تُظهر أن التأهيل المبكر يُضاعف فرص الاستقلالية.',
      recommendation: 'لا تؤجل — فعّل الباقة الشاملة اليوم وابدأ التقييم السريري المعتمد فوراً.',
    },
  };

  const en = {
    balanced: {
      title: 'Balanced profile with clear growth opportunities',
      summary:
        'Your answers show solid foundations with areas to strengthen early. Guided intervention now saves months of delay.',
      recommendation: 'We recommend the full assessment to build a precise 48-hour action plan.',
    },
    moderate: {
      title: 'Patterns worth focused follow-up',
      summary:
        'This preliminary result shows multi-domain support needs. Each week of delay reduces rapid progress chances.',
      recommendation: 'Full comprehensive assessment is essential — it reveals hidden strengths and session priorities.',
    },
    elevated: {
      title: 'High priority — act now',
      summary:
        'Answers indicate clear need for intensive early intervention. Aunak sovereign data shows early rehab doubles independence odds.',
      recommendation: 'Do not wait — activate the full plan today and start certified clinical assessment immediately.',
    },
  };

  const profiles = lang === 'en' ? en : ar;
  const p = profiles[band] ?? profiles.moderate;

  return {
    title: p.title,
    summary: p.summary,
    recommendation: p.recommendation,
    strengthsText: strengths.length
      ? (lang === 'en' ? 'Strengths: ' : 'نقاط قوة: ') + strengths.join(lang === 'en' ? ', ' : ' · ')
      : lang === 'en'
        ? 'Complete all questions for strength mapping'
        : 'أكمل جميع الأسئلة لرسم نقاط القوة',
    focusText: focusAreas.length
      ? (lang === 'en' ? 'Focus areas: ' : 'مجالات تركيز: ') + focusAreas.join(lang === 'en' ? ', ' : ' · ')
      : lang === 'en'
        ? 'No major focus flags in this pass'
        : 'لا توجد إشارات تركيز بارزة في هذه الجولة',
  };
}

/** Parse stored initial_assessment_score (number or JSON snapshot). */
export function parseStoredAssessmentScore(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'number' && Number.isFinite(raw)) return Math.round(raw);
  const direct = Number(raw);
  if (Number.isFinite(direct)) return Math.round(direct);
  try {
    const parsed = JSON.parse(String(raw));
    if (parsed?.score != null && Number.isFinite(Number(parsed.score))) {
      return Math.round(Number(parsed.score));
    }
  } catch {
    /* not JSON */
  }
  return null;
}

/** Rebuild parent-facing profile when only the numeric score is stored. */
export function buildAssessmentProfileFromScore(scorePercent, lang = 'ar') {
  const score = parseStoredAssessmentScore(scorePercent);
  if (score == null) return null;

  let band = 'balanced';
  if (score >= 66) band = 'elevated';
  else if (score >= 36) band = 'moderate';

  const profile = buildProfile({ band, scorePercent: score, strengths: [], focusAreas: [], lang });

  return {
    scorePercent: score,
    band,
    domainScores: {},
    strengths: [],
    focusAreas: [],
    ...profile,
    strengthsText:
      lang === 'en'
        ? 'Complete the free assessment for detailed domain mapping'
        : 'أكمل التقييم المجاني لرسم خريطة المجالات التفصيلية',
    focusText:
      lang === 'en'
        ? 'Stored score — domain breakdown available after full assessment'
        : 'النتيجة المحفوظة — تفصيل المجالات متاح بعد التقييم الشامل',
  };
}

/** JSON snapshot for Airtable (score + band + domains). */
export function assessmentScorePayload(result) {
  return JSON.stringify({
    score: result.scorePercent,
    band: result.band,
    domains: result.domainScores,
    at: new Date().toISOString(),
  });
}
````

## File: src/lib/luxTheme.js
````javascript
/** Luxury Cyber Dark — single source of truth for Aunak UI tokens */
export const LUX = {
  page: "min-h-screen bg-[#0a0a0c] text-slate-300 font-sans",
  pageFlex: "min-h-screen bg-[#0a0a0c] text-slate-300 font-sans flex flex-col",
  pageWrap:
    "relative min-h-screen bg-[#0a0a0c] text-slate-300 font-sans overflow-hidden",
  pageWrapGradient:
    "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(201,169,98,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(52,211,153,0.06)_0%,transparent_50%)]",

  glass:
    "bg-[#12121a]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_0_40px_rgba(201,169,98,0.08)]",
  glassCard:
    "p-6 md:p-8 rounded-3xl bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 text-slate-300 shadow-[0_0_48px_rgba(201,169,98,0.1)] transition-all",
  glassHoverGold:
    "hover:border-[#c9a962]/45 hover:shadow-[0_0_32px_rgba(201,169,98,0.18)]",
  glassHoverEmerald:
    "hover:border-emerald-400/45 hover:shadow-[0_0_32px_rgba(52,211,153,0.16)]",

  titleGradient:
    "text-2xl md:text-3xl font-bold bg-gradient-to-l from-[#e8c872] via-[#d4af37] to-[#c9a962] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(201,169,98,0.25)]",
  headingGold:
    "text-lg md:text-xl font-bold bg-gradient-to-l from-[#e8c872] to-[#c9a962] bg-clip-text text-transparent",
  subtitle: "text-xs md:text-sm text-slate-500 mt-1 font-mono",
  bodyText: "text-sm text-slate-300 leading-relaxed",
  muted: "text-slate-500",

  emeraldAccent: "text-emerald-400",
  emeraldValue: "text-emerald-300 font-mono",
  emeraldBadge:
    "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-medium",
  goldText: "text-[#e8c872]",
  goldMono: "font-mono text-[#e8c872]",

  input:
    "w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] text-slate-300 font-mono focus:border-emerald-400/45 focus:outline-none focus:ring-1 focus:ring-emerald-400/25 disabled:opacity-50 placeholder:text-slate-600",
  btnGold:
    "px-6 py-3 rounded-xl bg-gradient-to-r from-[#c9a962] to-[#d4af37] font-bold text-[#0a0a0c] hover:shadow-[0_0_32px_rgba(201,169,98,0.28)] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
  btnEmerald:
    "px-6 py-3 rounded-xl bg-emerald-500 text-[#0a0a0c] font-bold hover:shadow-[0_0_32px_rgba(52,211,153,0.28)] transition-all disabled:opacity-50",
  btnGhost:
    "px-4 py-2 rounded-xl bg-[#12121a]/50 border border-white/[0.08] text-slate-300 hover:border-[#c9a962]/35 hover:text-[#e8c872] transition-all",

  borderGold: "border-[#c9a962]/20",
  borderSubtle: "border-white/[0.06]",

  navActiveGold:
    "bg-[#c9a962]/14 text-[#e8c872] border border-[#c9a962]/40 shadow-[0_0_28px_rgba(201,169,98,0.16)]",
  navActiveLive:
    "bg-emerald-500/10 text-emerald-300 border border-emerald-400/35 shadow-[0_0_28px_rgba(52,211,153,0.16)]",
  navIdle:
    "text-slate-400 hover:bg-[#12121a]/55 hover:border-[#c9a962]/25 border border-transparent backdrop-blur-xl",

  headerBar:
    "p-6 md:p-8 border-b border-[#c9a962]/20 bg-[#12121a]/55 backdrop-blur-xl",
  aside:
    "w-72 bg-[#0d0d10]/95 backdrop-blur-xl flex flex-col z-10 shadow-2xl border-[#c9a962]/15",
  footer:
    "p-6 border-t border-[#c9a962]/15 flex items-center justify-between text-xs text-slate-500 font-mono bg-[#0d0d10]/95 backdrop-blur-xl",

  errorRose:
    "text-rose-300 bg-rose-500/10 border border-rose-400/35 rounded-xl px-4 py-3",

  /* Hub shell */
  root: "relative flex h-screen bg-[#0a0a0c] text-slate-300 font-sans overflow-hidden",
  main: "flex-1 min-h-0 overflow-y-auto bg-[#0a0a0c] relative z-0",
  contentColumn: "flex-1 flex flex-col min-w-0 min-h-0 relative z-0",
  asideShell:
    "relative z-20 flex flex-col h-full min-h-0 w-72 shrink-0 bg-[#0d0d10]/95 backdrop-blur-xl shadow-2xl",
  asideShellCollapsed: "w-14",
  asideBorderAr: "border-l border-[#c9a962]/25",
  asideBorderEn: "border-r border-[#c9a962]/25",
  sovereignTopBar:
    "shrink-0 z-30 flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[#c9a962]/20 bg-[#12121a]/75 backdrop-blur-xl",
  sovereignTopBarCompact: "px-3 py-2",
  sovereignControls:
    "flex items-center gap-1.5 sm:gap-2 shrink-0",
  sovereignIconBtn:
    "p-2 rounded-lg border border-white/[0.06] bg-[#12121a]/60 backdrop-blur-xl text-slate-400 hover:text-[#e8c872] hover:border-[#c9a962]/35 transition-all",
  sovereignIconBtnActive: "text-emerald-400 border-emerald-400/30 bg-emerald-500/10",
  sovereignLogoutBtn:
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#e8c872] bg-[#12121a]/60 backdrop-blur-xl border border-[#c9a962]/40 hover:border-[#e8c872]/50 hover:shadow-[0_0_20px_rgba(201,169,98,0.18)] transition-all",
  sovereignOnlineBadge:
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-400/25",
  sovereignRevealBtn:
    "fixed bottom-4 z-40 p-3 rounded-full bg-[#12121a]/90 backdrop-blur-xl border border-[#c9a962]/35 text-[#e8c872] shadow-[0_0_24px_rgba(201,169,98,0.2)] hover:border-emerald-400/40 transition-all",
  navArea: "flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5",
  userCardCompact:
    "flex items-center gap-2.5 p-2.5 mx-3 mt-3 rounded-xl bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15",
  headerSection:
    "p-6 border-b border-[#c9a962]/20 flex flex-col items-center text-center gap-4 bg-[#12121a]/55 backdrop-blur-xl",
  headerSectionCompact:
    "shrink-0 p-3 border-b border-[#c9a962]/20 flex flex-col items-center text-center gap-1.5 bg-[#12121a]/55 backdrop-blur-xl",
  hubTitleGradient:
    "text-xl font-bold bg-gradient-to-l from-[#e8c872] via-[#d4af37] to-[#c9a962] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(201,169,98,0.2)]",
  userCard:
    "flex items-center gap-3 p-3 rounded-xl bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 mb-3",
  sovereignBadge:
    "inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-[#e8c872] bg-[#c9a962]/12 border border-[#c9a962]/30 px-2 py-0.5 rounded backdrop-blur-xl",
  langBtn:
    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#12121a]/55 backdrop-blur-xl border border-white/[0.08] text-slate-300 hover:text-[#e8c872] hover:border-[#c9a962]/40 hover:shadow-[0_0_28px_rgba(201,169,98,0.14)] transition-all font-bold text-sm",
  navLocked: "text-slate-600 hover:bg-[#12121a]/40 border border-transparent",
  lockIcon: "text-[#c9a962]/70",
  logoFocus:
    "min-h-[44px] min-w-[44px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a962]/45 shrink-0",
  audioOn: "text-emerald-400 hover:bg-emerald-500/10",
  audioOff: "text-slate-600 hover:bg-[#12121a]/50",

  /* Gate-specific */
  encryptedBadge:
    "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/30 backdrop-blur-xl text-emerald-300 text-sm font-medium",
  panelGlass:
    "max-w-lg w-full bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 rounded-3xl p-8 text-center shadow-[0_0_48px_rgba(201,169,98,0.1)]",
  videoFrame:
    "relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d0d10] mb-6",
  scanProgress: "text-emerald-300 text-sm font-mono",
  formGlass:
    "max-w-md w-full bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 rounded-3xl p-8 shadow-[0_0_48px_rgba(201,169,98,0.1)]",
  formHeading:
    "text-lg font-bold bg-gradient-to-l from-[#e8c872] to-[#c9a962] bg-clip-text text-transparent",
  enrollmentBar:
    "p-4 border-b border-[#c9a962]/20 bg-[#12121a]/55 backdrop-blur-xl space-y-3",
  enrollmentInput:
    "w-full px-3 py-2 rounded-lg bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 font-mono text-sm text-[#e8c872] focus:border-emerald-400/40 focus:outline-none",
  backMuted: "text-slate-500 text-sm inline-flex items-center gap-2",
  backLink: "mt-6 text-xs text-slate-500",
  enterParentBtn: "mt-4 px-8 py-3 rounded-xl bg-emerald-500 text-[#0a0a0c] font-bold",

  logoutBtn:
    "w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-xl text-sm font-bold text-[#e8c872] bg-[#12121a]/60 backdrop-blur-xl border border-[#c9a962]/45 hover:border-[#e8c872]/50 hover:shadow-[0_0_28px_rgba(201,169,98,0.22),0_0_16px_rgba(244,63,94,0.06)] transition-all",
  navScroll: "lux-nav-scroll",
  gateCardTitle:
    "text-lg font-bold bg-gradient-to-l from-[#e8c872] to-[#c9a962] bg-clip-text text-transparent",
  harmonyPending: "text-[#c9a962]",
  eyeMapCellEmpty: "rounded-sm bg-white/[0.04] border border-white/[0.06]",
  eyeMapCellActive: "rounded-sm bg-gradient-to-br from-[#c9a962] to-emerald-400",
  pillarGold:
    "border-[#c9a962]/30 bg-[#12121a]/70 backdrop-blur-xl hover:border-[#c9a962]/50 shadow-[0_0_24px_rgba(201,169,98,0.06)]",
  pillarEmerald:
    "border-emerald-400/30 bg-[#12121a]/70 backdrop-blur-xl hover:border-emerald-400/50 shadow-[0_0_24px_rgba(52,211,153,0.06)]",
  pillarMuted:
    "border-[#c9a962]/18 bg-[#12121a]/55 backdrop-blur-xl hover:border-[#c9a962]/35 shadow-[0_0_20px_rgba(201,169,98,0.04)]",

  /* Aliases */
  cardGlass:
    "p-8 rounded-3xl bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 text-center transition-all shadow-[0_0_48px_rgba(201,169,98,0.1)]",
  cardGoldHover:
    "hover:border-[#c9a962]/45 hover:shadow-[0_0_32px_rgba(201,169,98,0.18)]",
  cardEmeraldHover:
    "hover:border-emerald-400/45 hover:shadow-[0_0_32px_rgba(52,211,153,0.16)]",
  header:
    "p-6 md:p-8 border-b border-[#c9a962]/20 bg-[#12121a]/55 backdrop-blur-xl",
  inputGlass:
    "w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] mb-4 font-mono text-center text-slate-300 focus:border-emerald-400/45 focus:outline-none focus:ring-1 focus:ring-emerald-400/25 disabled:opacity-50",
  submitGold:
    "w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a962] to-[#d4af37] font-bold text-[#0a0a0c] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_32px_rgba(201,169,98,0.28)] transition-all",
  scanBtnEmerald:
    "px-8 py-3 rounded-xl bg-emerald-500 text-[#0a0a0c] font-bold hover:shadow-[0_0_32px_rgba(52,211,153,0.28)] transition-all",
  childCodeMono: "font-mono text-[#e8c872]",
};

/** Panel wrapper used across feature screens */
export function luxScreen(className = "") {
  return `${LUX.page} p-4 md:p-6 ${className}`.trim();
}

export function luxCard(className = "") {
  return `${LUX.glassCard} ${className}`.trim();
}
````

## File: src/lib/mockPayments.js
````javascript
/**
 * Sovereign mock payment layer — Preview / dev only when Tap key absent.
 * Simulates CAPTURED charges + webhook path without sk_test_.
 */

import { isTapConfigured } from './tapPayments.js';
import { planAmountForTap } from './paymentPlans.js';
import { normalizePlanCode, PLAN_CODES } from './plans.js';

export const MOCK_CHARGE_PREFIX = 'chg_MOCK_';
export const MOCK_WEBHOOK_HEADER = 'x-aunak-mock-payment';

export function isMockPaymentsEnabled() {
  if (process.env.MOCK_PAYMENTS === 'false') return false;
  if (process.env.MOCK_PAYMENTS === 'true') return true;
  if (process.env.VERCEL_ENV === 'production') return false;
  if (isTapConfigured()) return false;
  return (
    process.env.VERCEL_ENV === 'preview' ||
    process.env.VERCEL_ENV === 'development' ||
    process.env.NODE_ENV === 'development'
  );
}

export function isMockChargeId(chargeId) {
  return String(chargeId ?? '').startsWith(MOCK_CHARGE_PREFIX);
}

export function buildMockChargeId() {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${MOCK_CHARGE_PREFIX}${ts}_${rand}`;
}

/** Tap-shaped charge payload for webhook + verify-return. */
export function buildMockCharge({ chargeId, studentId, plan, amount, currency, flow = 'enrollment' }) {
  const id = chargeId || buildMockChargeId();
  const planNorm = normalizePlanCode(plan) || PLAN_CODES.TUTOR;
  const pricing = amount != null ? { amount, currency } : planAmountForTap(planNorm);

  return {
    id,
    object: 'charge',
    live_mode: false,
    status: 'CAPTURED',
    amount: pricing.amount,
    currency: pricing.currency,
    metadata: {
      student_id: studentId,
      plan_code: planNorm,
      flow,
      platform: 'aunak',
      mock: true,
    },
    reference: {
      gateway: 'MOCK_GATEWAY',
      payment: `MOCK_PAY_${Date.now()}`,
    },
    transaction: {
      created: String(Date.now()),
    },
  };
}

export function verifyMockWebhookRequest(charge, headers = {}) {
  if (!isMockPaymentsEnabled() || !isMockChargeId(charge?.id)) return false;
  const header = headers[MOCK_WEBHOOK_HEADER] || headers[MOCK_WEBHOOK_HEADER.toLowerCase()];
  return header === 'sovereign-preview' || Boolean(charge?.metadata?.mock);
}

export function activationReferenceForCharge(chargeId, paymentMethod = 'tap') {
  const id = String(chargeId ?? '').replace(/[^\x20-\x7E]/g, '').trim();
  const prefix = paymentMethod === 'mock' ? 'MOCK' : 'TAP';
  return `${prefix}-${id}`;
}
````

## File: src/lib/parentAccess.js
````javascript
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
````

## File: src/lib/parentDashboardEngine.js
````javascript
/**
 * Parent dashboard — assessment profile, session ledger, treatment metrics.
 */

import { fetchSealedClaimsForStudent } from './airtable';
import { mapSealedClaim, computeDateRange, REPORT_PERIODS } from './reportEngine';
import { buildAssessmentProfileFromScore, parseStoredAssessmentScore } from './initialAssessmentEngine';
import { getField } from './airtable';
import { STUDENT as SF } from './airtableFields';

const METRIC_FIELDS = [
  { key: 'academicProgress', field: SF.academic_progress, labelAr: 'التقدم الأكاديمي', labelEn: 'Academic progress', color: 'emerald' },
  { key: 'focusLevel', field: SF.focus_level, labelAr: 'مستوى التركيز', labelEn: 'Focus level', color: 'cyan' },
  { key: 'improvementIndex', field: SF.improvement_index, labelAr: 'مؤشر التحسن', labelEn: 'Improvement index', color: 'amber' },
  { key: 'operatingEfficiency', field: SF.operating_efficiency, labelAr: 'كفاءة التشغيل', labelEn: 'Operating efficiency', color: 'violet' },
];

function clampPercent(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return null;
  return Math.min(100, Math.max(0, Math.round(v)));
}

export function buildParentAssessmentView(student, lang = 'ar') {
  const raw =
    student?.initialAssessmentScore ??
    getField(student?.fields, SF.initial_assessment_score);
  const score = parseStoredAssessmentScore(raw);
  if (score == null) {
    return {
      hasAssessment: false,
      score: null,
      result: null,
      comprehensiveStatus:
        student?.comprehensiveAssessmentStatus ??
        getField(student?.fields, SF.comprehensive_assessment_status) ??
        'not_started',
    };
  }

  return {
    hasAssessment: true,
    score,
    result: buildAssessmentProfileFromScore(score, lang),
    comprehensiveStatus:
      student?.comprehensiveAssessmentStatus ??
      getField(student?.fields, SF.comprehensive_assessment_status) ??
      'not_started',
  };
}

export function buildTreatmentMetrics(student, lang = 'ar') {
  const programmedGoal =
    student?.programmedGoal ?? getField(student?.fields, SF.programmed_goal) ?? null;
  const harmonyScore = student?.harmonyScore ?? null;
  const behaviorIntensity = clampPercent(
    student?.behaviorIntensity ?? getField(student?.fields, SF.behavior_intensity)
  );

  const metrics = METRIC_FIELDS.map(({ key, field, labelAr, labelEn, color }) => {
    const raw = student?.[key] ?? getField(student?.fields, field);
    const value = clampPercent(raw);
    return {
      key,
      label: lang === 'en' ? labelEn : labelAr,
      value,
      color,
    };
  }).filter((m) => m.value != null);

  const behaviorStability =
    behaviorIntensity != null ? clampPercent(100 - behaviorIntensity) : null;

  if (behaviorStability != null) {
    metrics.push({
      key: 'behaviorStability',
      label: lang === 'en' ? 'Behavior stability' : 'استقرار السلوك',
      value: behaviorStability,
      color: 'rose',
    });
  }

  const overall =
    metrics.length > 0
      ? Math.round(metrics.reduce((a, m) => a + (m.value ?? 0), 0) / metrics.length)
      : harmonyScore != null
        ? clampPercent(harmonyScore)
        : null;

  return {
    programmedGoal: programmedGoal ? String(programmedGoal).trim() : null,
    harmonyScore: harmonyScore != null ? clampPercent(harmonyScore) : null,
    metrics,
    overallProgress: overall,
  };
}

export async function fetchParentSessionLedger(student, { days = 90 } = {}) {
  const name = String(student?.name ?? '').trim();
  if (!name) return [];

  try {
    const apiResult = await fetchParentSessionsViaApi(name, days);
    if (apiResult?.sessions?.length) {
      return sortSessions(apiResult.sessions);
    }
  } catch {
    /* server route unavailable */
  }

  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days + 1);

  try {
    const records = await fetchSealedClaimsForStudent({
      studentName: name,
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
    });
    const mapped = sortSessions(records.map((r) => mapSealedClaim(r)));
    if (mapped.length) return mapped;
  } catch {
    /* direct client fetch blocked */
  }

  return buildStudentSessionFallback(student);
}

async function fetchParentSessionsViaApi(studentName, days = 90) {
  const params = new URLSearchParams({
    studentName: String(studentName).trim(),
    days: String(days),
  });
  const res = await fetch(`/api/parent/sessions?${params.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (!Array.isArray(data?.sessions)) return null;
  return { sessions: data.sessions, meta: data };
}

/** Fallback ledger from Students row when tblDailySessions is unreachable. */
export function buildStudentSessionFallback(student) {
  const f = student?.fields ?? {};
  const name = String(student?.name ?? getField(f, SF.name) ?? '').trim();
  const attendanceAt = getField(f, SF.biometric_attendance_at);
  const sessionTime = getField(f, SF.session_start_time);
  const notes =
    getField(f, SF.clinical_session_notes) ||
    getField(f, SF.ai_session_report) ||
    getField(f, SF.zero_point_report);
  const status = getField(f, SF.clinical_session_status);
  const verified = Boolean(getField(f, SF.biometric_attendance_verified));

  if (!attendanceAt && !notes && !sessionTime && !status) return [];

  let sessionDate = new Date().toISOString().slice(0, 10);
  if (attendanceAt) {
    const d = new Date(attendanceAt);
    if (!Number.isNaN(d.getTime())) sessionDate = d.toISOString().slice(0, 10);
  }

  const noteParts = [];
  if (status) noteParts.push(String(status));
  if (sessionTime) noteParts.push(String(sessionTime));
  if (notes) noteParts.push(String(notes));

  return [
    {
      id: `student-${student?.id ?? 'row'}-snapshot`,
      sessionDate,
      specialistName: '',
      studentName: name,
      notes: noteParts.join(' · '),
      sealedAt: attendanceAt ?? null,
      sessionSequence: 1,
      claimStatus: 'Sealed',
      pinVerified: verified,
      source: 'student_record',
    },
  ];
}

function sortSessions(sessions) {
  return [...sessions].sort((a, b) => {
    const da = String(a.sessionDate ?? '');
    const db = String(b.sessionDate ?? '');
    if (da !== db) return db.localeCompare(da);
    return (b.sessionSequence ?? 0) - (a.sessionSequence ?? 0);
  });
}

export function sessionAttendanceSummary(sessions, lang = 'ar') {
  const total = sessions.length;
  const specialists = [...new Set(sessions.map((s) => s.specialistName).filter(Boolean))];
  const last = sessions[0] ?? null;

  return {
    total,
    specialistCount: specialists.length,
    lastSessionDate: last?.sessionDate ?? null,
    lastSpecialist: last?.specialistName ?? null,
    label:
      lang === 'en'
        ? `${total} sealed session${total === 1 ? '' : 's'} on record`
        : `${total} جلسة موثّقة في السجل`,
  };
}

export { computeDateRange, REPORT_PERIODS };
````

## File: src/lib/paymentActivation.js
````javascript
/**
 * Post-payment Airtable activation — shared by webhook, return verify, and manual redeem.
 * pending → active · triple tokens · idempotent on same charge reference.
 */

import { STUDENT as SF } from './airtableFields.js';
import { landingForPlan, PLAN_CODES, normalizePlanCode } from './plans.js';
import {
  generateTripleDeviceTokens,
  buildActivationRedeemFields,
  buildTriplePortalLinks,
} from './tripleAccessProtocol.js';

export function sanitizeAscii(value) {
  if (value == null) return '';
  return String(value).replace(/[^\x20-\x7E]/g, '').trim();
}

export function airtableConfigFromEnv() {
  const apiKey = process.env.AIRTABLE_API_KEY || process.env.VITE_AIRTABLE_PAT;
  const baseId = sanitizeAscii(
    process.env.AIRTABLE_BASE_ID || process.env.VITE_AIRTABLE_BASE_ID || 'appaGfKj4vYhMw0cb'
  ).split('/')[0];
  const studentsTable =
    sanitizeAscii(process.env.VITE_AIRTABLE_STUDENTS_TABLE_ID) || 'tblzYmBGmCxx2vdcr';
  return { apiKey, baseId, studentsTable };
}

export function subscriptionFieldsForPayment(plan, { paymentMethod = 'tap', chargeId } = {}) {
  const p = normalizePlanCode(plan) ?? PLAN_CODES.TUTOR;
  const expires = new Date();
  expires.setMonth(expires.getMonth() + 1);
  const fields = {
    [SF.subscription_status]: 'active',
    [SF.plan_code]: p,
    [SF.last_payment_at]: new Date().toISOString(),
    [SF.payment_method]: paymentMethod,
    [SF.subscription_expires_at]: expires.toISOString().slice(0, 10),
    [SF.preferred_destination]: landingForPlan(p),
  };
  if (chargeId) {
    const prefix = paymentMethod === 'mock' ? 'MOCK' : 'TAP';
    fields[SF.activation_code_used] = `${prefix}-${sanitizeAscii(chargeId)}`;
  }
  return fields;
}

export async function fetchStudentRecord(studentId, config = airtableConfigFromEnv()) {
  const { apiKey, baseId, studentsTable } = config;
  if (!apiKey || !studentId) return null;

  const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${encodeURIComponent(studentId)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${sanitizeAscii(apiKey)}`, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  return res.json();
}

/** Skip re-activation if this exact charge was already processed. */
export function isAlreadyActivatedForCharge(existingFields, chargeId, paymentMethod = 'tap') {
  if (!existingFields || !chargeId) return false;
  const used = String(existingFields[SF.activation_code_used] ?? '').trim();
  const id = sanitizeAscii(chargeId);
  const primary = paymentMethod === 'mock' ? `MOCK-${id}` : `TAP-${id}`;
  if (used === primary) return true;
  return used === `TAP-${id}` || used === `MOCK-${id}`;
}

/**
 * Activate student after successful payment.
 * @returns {{ plan, landing, active, deviceTokens, alreadyActivated, airtable? }}
 */
export async function activateStudentAfterPayment({
  studentId,
  plan,
  chargeId,
  paymentMethod = 'tap',
  config = airtableConfigFromEnv(),
  origin = 'https://aunak.vercel.app',
}) {
  const planNorm = normalizePlanCode(plan) ?? PLAN_CODES.TUTOR;
  const { apiKey, baseId, studentsTable } = config;

  if (!studentId) throw new Error('STUDENT_ID_REQUIRED');

  const existing = await fetchStudentRecord(studentId, config);
  const existingFields = existing?.fields ?? null;

  if (chargeId && isAlreadyActivatedForCharge(existingFields, chargeId, paymentMethod)) {
    const tokens = {
      parent: existingFields?.[SF.parent_access_token] ?? null,
      child: existingFields?.[SF.child_interactive_token] ?? null,
      specialist: existingFields?.[SF.specialist_tutor_token] ?? null,
    };
    return {
      plan: planNorm,
      landing: landingForPlan(planNorm),
      subscriptionRaw: 'active',
      active: true,
      alreadyActivated: true,
      deviceTokens: tokens,
      portalLinks: buildTriplePortalLinks(origin, tokens),
    };
  }

  const deviceTokens = generateTripleDeviceTokens();
  const subscriptionFields = subscriptionFieldsForPayment(planNorm, { paymentMethod, chargeId });
  const comprehensiveStatus = existingFields?.[SF.comprehensive_assessment_status] ?? null;
  const fields = buildActivationRedeemFields(subscriptionFields, {
    tokens: deviceTokens,
    existingComprehensiveStatus: comprehensiveStatus,
  });

  if (!apiKey) {
    return {
      plan: planNorm,
      landing: landingForPlan(planNorm),
      subscriptionRaw: 'active',
      active: true,
      mode: 'client_fallback',
      deviceTokens,
      portalLinks: buildTriplePortalLinks(origin, deviceTokens),
      alreadyActivated: false,
    };
  }

  const recordUrl = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(studentsTable)}/${encodeURIComponent(studentId)}`;
  const response = await fetch(recordUrl, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${sanitizeAscii(apiKey)}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields, typecast: true }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text.slice(0, 300) || 'AIRTABLE_PATCH_FAILED');
  }

  return {
    plan: planNorm,
    landing: landingForPlan(planNorm),
    subscriptionRaw: 'active',
    active: true,
    deviceTokens,
    portalLinks: buildTriplePortalLinks(origin, deviceTokens),
    alreadyActivated: false,
    airtable: JSON.parse(text),
  };
}
````

## File: src/lib/paymentClient.js
````javascript
/**
 * Client-side payment checkout — initiates Tap hosted page (no secrets on client).
 */

import { DEFAULT_CHECKOUT_PLAN } from './paymentPlans';

const PENDING_KEY = 'aunak_payment_pending';
const COMPLETE_KEY = 'aunak_payment_complete';
const ENROLLMENT_DRAFT_KEY = 'aunak_enrollment_draft';

export function saveEnrollmentDraft(draft) {
  try {
    sessionStorage.setItem(ENROLLMENT_DRAFT_KEY, JSON.stringify({ ...draft, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function readEnrollmentDraft() {
  try {
    const raw = sessionStorage.getItem(ENROLLMENT_DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearEnrollmentDraft() {
  try {
    sessionStorage.removeItem(ENROLLMENT_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

export function savePaymentPending(payload) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify({ ...payload, savedAt: Date.now() }));
  } catch {
    /* ignore */
  }
}

export function readPaymentPending() {
  try {
    const raw = sessionStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPaymentPending() {
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* ignore */
  }
}

export function savePaymentComplete(payload) {
  try {
    sessionStorage.setItem(COMPLETE_KEY, JSON.stringify({ ...payload, completedAt: Date.now() }));
    clearPaymentPending();
  } catch {
    /* ignore */
  }
}

export function readPaymentComplete() {
  try {
    const raw = sessionStorage.getItem(COMPLETE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearPaymentComplete() {
  try {
    sessionStorage.removeItem(COMPLETE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Create Tap checkout session and redirect browser to hosted payment page.
 */
export async function startTapCheckout({
  studentId,
  plan = DEFAULT_CHECKOUT_PLAN,
  flow = 'enrollment',
  customer,
}) {
  if (!studentId) throw new Error('STUDENT_ID_REQUIRED');

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const redirectUrl = `${origin}/payment/return?flow=${encodeURIComponent(flow)}&studentId=${encodeURIComponent(studentId)}&plan=${encodeURIComponent(plan)}`;

  const res = await fetch('/api/payment/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ studentId, plan, flow, customer, redirectUrl }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.error || data?.message || 'CHECKOUT_FAILED');
  }

  savePaymentPending({
    studentId,
    plan,
    flow,
    chargeId: data.chargeId,
    checkoutUrl: data.checkoutUrl,
  });

  if (flow === 'enrollment' && typeof window !== 'undefined') {
    const draft = readEnrollmentDraft();
    if (draft) saveEnrollmentDraft({ ...draft, recordId: studentId, plan });
  }

  if (!data.checkoutUrl) throw new Error('NO_CHECKOUT_URL');
  window.location.assign(data.checkoutUrl);
  return data;
}

/** Verify payment after Tap redirect (webhook may have already activated). */
export async function verifyPaymentReturn({ chargeId, studentId, plan, flow }) {
  const params = new URLSearchParams();
  if (chargeId) params.set('chargeId', chargeId);
  if (studentId) params.set('studentId', studentId);
  if (plan) params.set('plan', plan);
  if (flow) params.set('flow', flow);

  const res = await fetch(`/api/payment/verify-return?${params.toString()}`, {
    headers: { Accept: 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'VERIFY_FAILED');
  return data;
}
````

## File: src/lib/paymentPlans.js
````javascript
/**
 * Sovereign plan pricing — server is source of truth (never trust client amounts).
 * Tap Payments · SAR default · HyperPay-compatible metadata shape.
 */

import { PLAN_CODES, normalizePlanCode } from './plans.js';

/** Monthly subscription prices (SAR). Institution = manual / B2B. */
export const PLAN_PRICING = {
  [PLAN_CODES.TUTOR]: {
    amount: 299,
    currency: 'SAR',
    billingMonths: 1,
  },
  [PLAN_CODES.MEDICAL]: {
    amount: 499,
    currency: 'SAR',
    billingMonths: 1,
  },
  [PLAN_CODES.ASSESSMENT_ONLY]: {
    amount: 199,
    currency: 'SAR',
    billingMonths: 1,
  },
  [PLAN_CODES.FREE]: {
    amount: 0,
    currency: 'SAR',
    billingMonths: 1,
  },
};

export const DEFAULT_CHECKOUT_PLAN = PLAN_CODES.TUTOR;

export const CHECKOUT_PLAN_OPTIONS = [
  PLAN_CODES.TUTOR,
  PLAN_CODES.MEDICAL,
  PLAN_CODES.ASSESSMENT_ONLY,
];

export function getPlanPricing(planCode) {
  const plan = normalizePlanCode(planCode);
  return PLAN_PRICING[plan] ?? PLAN_PRICING[DEFAULT_CHECKOUT_PLAN];
}

/** ISO decimal places for Tap hashstring + charge amount. */
export function formatTapAmount(amount, currency = 'SAR') {
  const threeDecimal = ['BHD', 'KWD', 'OMR', 'JOD'];
  const decimals = threeDecimal.includes(String(currency).toUpperCase()) ? 3 : 2;
  return Number(amount).toFixed(decimals);
}

export function planAmountForTap(planCode) {
  const { amount, currency } = getPlanPricing(planCode);
  return {
    amount: Number(formatTapAmount(amount, currency)),
    currency,
  };
}
````

## File: src/lib/paymentWebhookProcessor.js
````javascript
/**
 * Shared CAPTURED charge → Airtable activation (Tap + Mock).
 */

import { sanitizeAscii, activateStudentAfterPayment } from './paymentActivation.js';
import { normalizePlanCode, PLAN_CODES } from './plans.js';
import { isMockChargeId } from './mockPayments.js';
import { buildTriplePortalLinks } from './tripleAccessProtocol.js';

export async function processCapturedPaymentCharge(charge, { origin } = {}) {
  const status = String(charge?.status ?? '').toUpperCase();
  if (status !== 'CAPTURED') {
    return { ok: true, ignored: true, status };
  }

  const studentId = sanitizeAscii(charge.metadata?.student_id || charge.metadata?.udf1);
  const plan = normalizePlanCode(charge.metadata?.plan_code || charge.metadata?.udf2) || PLAN_CODES.TUTOR;

  if (!studentId) {
    return { ok: true, warning: 'NO_STUDENT_IN_METADATA' };
  }

  const paymentMethod = isMockChargeId(charge.id) || charge.metadata?.mock ? 'mock' : 'tap';
  const result = await activateStudentAfterPayment({
    studentId,
    plan,
    chargeId: charge.id,
    paymentMethod,
    origin: origin ?? 'https://aunak.vercel.app',
  });

  return {
    ok: true,
    activated: result.active,
    alreadyActivated: result.alreadyActivated ?? false,
    studentId,
    plan: result.plan,
    paymentMethod,
    parentTokenIssued: Boolean(result.deviceTokens?.parent),
    deviceTokens: result.deviceTokens,
    portalLinks: result.portalLinks ?? buildTriplePortalLinks(origin, result.deviceTokens),
    mode: result.mode ?? null,
  };
}
````

## File: src/lib/plans.js
````javascript
/**
 * Value Lock System — المصفوفة الخماسية السيادية لمنصة عونك.
 *
 * Tiers (cumulative): free < tutor < medical < institution
 * Exception: assessment_only — باقة تقييم معزولة (diagnostics فقط).
 */

export const PLAN_CODES = {
  FREE: 'free',
  INSTITUTION: 'institution',
  TUTOR: 'tutor',
  MEDICAL: 'medical',
  ASSESSMENT_ONLY: 'assessment_only',
  /** @deprecated use INSTITUTION — kept for session migration */
  B2C: 'tutor',
  B2B: 'institution',
  B2G: 'institution',
};

const RANK = {
  free: 0,
  tutor: 1,
  medical: 2,
  institution: 3,
};

export function planRank(plan) {
  const p = normalizePlanCode(plan);
  if (p === PLAN_CODES.ASSESSMENT_ONLY) return -1;
  return RANK[p] ?? 0;
}

export function normalizePlanCode(plan) {
  const v = String(plan ?? '').trim().toLowerCase();
  if (v === 'b2c') return PLAN_CODES.TUTOR;
  if (v === 'b2b' || v === 'b2g') return PLAN_CODES.INSTITUTION;
  return v || PLAN_CODES.FREE;
}

/** Parse a raw 'كود الباقة' / subscription value into a canonical plan code. */
export function resolvePlanCode(raw) {
  const v = String(raw ?? '').trim().toLowerCase();
  if (!v) return null;
  if (/assessment[\s_-]?only|تقييم[\s_-]?فقط|تقييم[\s_-]?شامل/.test(v)) {
    return PLAN_CODES.ASSESSMENT_ONLY;
  }
  if (/institution|b2g|b2b|سياد|sovereign|gov|مراكز|مركز|center|وزار/.test(v)) {
    return PLAN_CODES.INSTITUTION;
  }
  if (/medical|طب|doctor|clinic|عياد|طبيب/.test(v)) {
    return PLAN_CODES.MEDICAL;
  }
  if (/tutor|b2c|مدرس|خصوص|منزل|أسرة|اسرة|عائل|family|home/.test(v)) {
    return PLAN_CODES.TUTOR;
  }
  if (/free|مجاني|community|مجتمع/.test(v)) return PLAN_CODES.FREE;
  return null;
}

/** Minimum plan required to open each section of the hub. */
export const SECTION_MIN_PLAN = {
  community: PLAN_CODES.FREE,
  resources: PLAN_CODES.FREE,
  media: PLAN_CODES.TUTOR,
  biometrics: PLAN_CODES.TUTOR,
  emotion: PLAN_CODES.TUTOR,
  learning: PLAN_CODES.TUTOR,
  classrooms: PLAN_CODES.TUTOR,
  diagnostics: PLAN_CODES.MEDICAL,
  crisis: PLAN_CODES.MEDICAL,
  live: PLAN_CODES.MEDICAL,
  scientific: PLAN_CODES.MEDICAL,
  registry: PLAN_CODES.INSTITUTION,
  behavior: PLAN_CODES.INSTITUTION,
  enrollment: PLAN_CODES.INSTITUTION,
  specialists: PLAN_CODES.INSTITUTION,
  research: PLAN_CODES.INSTITUTION,
  reports: PLAN_CODES.MEDICAL,
  access: PLAN_CODES.INSTITUTION,
  summerAcademy: PLAN_CODES.FREE,
};

const ASSESSMENT_ONLY_SECTIONS = new Set(['diagnostics', 'enrollment']);

export function planAllows(plan, sectionId) {
  const p = normalizePlanCode(plan);
  if (p === PLAN_CODES.ASSESSMENT_ONLY) {
    return ASSESSMENT_ONLY_SECTIONS.has(sectionId);
  }
  const min = SECTION_MIN_PLAN[sectionId] ?? PLAN_CODES.FREE;
  return planRank(p) >= planRank(min);
}

/** Institution-tier or higher — harmony scores & eye-tracking maps. */
export function isActiveB2B(plan) {
  const p = normalizePlanCode(plan);
  return p === PLAN_CODES.INSTITUTION || planRank(p) >= RANK.institution;
}

export function isActiveInstitution(plan) {
  return isActiveB2B(plan);
}

export const B2B_PREMIUM_TAG = 'B2B_PREMIUM';

export function hasB2BPremiumTag(rawStatus) {
  return /b2b[\s_-]?premium|institution[\s_-]?premium/i.test(String(rawStatus ?? ''));
}

export function resolveEnrollmentAccess(statusRaw) {
  const s = String(statusRaw ?? '').trim().toLowerCase();
  if (s === 'new' || s === 'جديد') {
    return { allowed: true, tier: 'new', plan: PLAN_CODES.FREE };
  }
  if (s === 'active' || s === 'نشط') {
    return { allowed: true, tier: 'active', plan: null };
  }
  if (s === 'pending' || s === 'معلق' || s === 'بانتظار') {
    return { allowed: true, tier: 'pending', plan: PLAN_CODES.FREE };
  }
  return { allowed: false, tier: 'blocked', plan: null };
}

export function resolvePlanFromStudentFields(fields, getFieldFn) {
  if (!fields || !getFieldFn) return PLAN_CODES.FREE;
  const raw =
    getFieldFn(fields, 'plan_code') ||
    getFieldFn(fields, 'subscription_status');
  return resolvePlanCode(raw) ?? PLAN_CODES.FREE;
}

/** Preferred landing section after activation by plan. */
export const PLAN_LANDING = {
  [PLAN_CODES.FREE]: 'community',
  [PLAN_CODES.TUTOR]: 'media',
  [PLAN_CODES.MEDICAL]: 'diagnostics',
  [PLAN_CODES.INSTITUTION]: 'registry',
  [PLAN_CODES.ASSESSMENT_ONLY]: 'diagnostics',
};

export function landingForPlan(plan) {
  const p = normalizePlanCode(plan);
  return PLAN_LANDING[p] ?? PLAN_LANDING[PLAN_CODES.FREE];
}

export const PLAN_LABELS = {
  ar: {
    free: 'المنصة المجتمعية',
    institution: 'المراكز والوزارات',
    tutor: 'المدرس الخصوصي',
    medical: 'الأطباء والعيادات',
    assessment_only: 'باقة التقييم الشامل',
  },
  en: {
    free: 'Community Platform',
    institution: 'Centers & Ministries',
    tutor: 'Private Tutor',
    medical: 'Doctors & Clinics',
    assessment_only: 'Full Assessment Only',
  },
};
````

## File: src/lib/reportEngine.js
````javascript
/**
 * Aunak AI Report Engine — sealed-claim aggregation + professional report composition.
 * Data source: tblDailySessions (tbl3mlewMLvqp6AXB) — read-only Sealed claims.
 */

import { fetchSealedClaimsForStudent, DAILY_SESSION_FIELDS } from './airtable';

export const REPORT_PERIODS = {
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
};

export const KNOWN_SPECIALISTS = ['هاجر', 'ساجدة', 'محمد', 'Hajar', 'Sagida', 'Muhammad', 'Sajida'];

const DS = DAILY_SESSION_FIELDS;

const ACADEMIC_RE =
  /هدف|تعل[مم]|قراء|كتاب|مهار|أكاد|درس|نشاط|تمارين|إدراك|فهم|حساب|لغة|skill|goal|learn|read|write|academic|task|lesson|progress|تحصيل|إنجاز/i;

const BEHAVIOR_RE =
  /سلوك|انفع|نزو|هدو|تواصل|انتباه|اجتماع|نفس|مزاج|تعاون|اندماج|behavior|emotion|social|attention|calm|tantrum|meltdown|استقرار|تنظيم/i;

const RECOMMENDATION_RE =
  /يوص|ينصح|متابع|منزل|ولي|تكرار|تدريب|recommend|home|follow|practice|parent|daily|routine/i;

export function computeDateRange(period = REPORT_PERIODS.WEEKLY, referenceDate = new Date()) {
  const end = new Date(referenceDate);
  const start = new Date(referenceDate);
  const days = period === REPORT_PERIODS.MONTHLY ? 30 : 7;
  start.setDate(start.getDate() - days + 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    days,
  };
}

export function mapSealedClaim(record) {
  const f = record?.fields ?? {};
  return {
    id: record?.id ?? null,
    sessionDate: f[DS.sessionDate] ?? '',
    specialistName: String(f[DS.specialistName] ?? '').trim(),
    studentName: String(f[DS.studentName] ?? '').trim(),
    notes: String(f[DS.notes] ?? '').trim(),
    sealedAt: f[DS.sealedAt] ?? null,
    sessionSequence: f[DS.sessionSequence] ?? null,
    claimStatus: f[DS.claimStatus] ?? 'Sealed',
    pinVerified: Boolean(f[DS.pinVerified]),
  };
}

function sortSessions(sessions) {
  return [...sessions].sort((a, b) => {
    const da = String(a.sessionDate ?? '');
    const db = String(b.sessionDate ?? '');
    if (da !== db) return da.localeCompare(db);
    return (a.sessionSequence ?? 0) - (b.sessionSequence ?? 0);
  });
}

function classifyNote(notes) {
  const text = String(notes ?? '').trim();
  if (!text) return { academic: false, behavioral: false, recommendation: false };
  return {
    academic: ACADEMIC_RE.test(text),
    behavioral: BEHAVIOR_RE.test(text),
    recommendation: RECOMMENDATION_RE.test(text),
  };
}

function groupBySpecialist(sessions) {
  const map = new Map();
  for (const s of sessions) {
    const key = s.specialistName || '—';
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return [...map.entries()].map(([name, items]) => ({ specialistName: name, sessions: items }));
}

function periodLabel(period, lang) {
  if (lang === 'en') return period === REPORT_PERIODS.MONTHLY ? 'Monthly' : 'Weekly';
  return period === REPORT_PERIODS.MONTHLY ? 'شهري' : 'أسبوعي';
}

function buildAcademicSection(sessions, lang) {
  const academicSessions = sessions.filter((s) => {
    const c = classifyNote(s.notes);
    return c.academic || (!c.behavioral && s.notes);
  });

  const highlights = academicSessions
    .filter((s) => s.notes)
    .map((s) => ({
      date: s.sessionDate,
      specialist: s.specialistName,
      text: s.notes,
    }));

  const bySpecialist = groupBySpecialist(academicSessions).map(({ specialistName, sessions: items }) => ({
    specialistName,
    sessionCount: items.length,
    notes: items.filter((i) => i.notes).map((i) => ({ date: i.sessionDate, text: i.notes })),
  }));

  let summary;
  if (highlights.length === 0) {
    summary =
      lang === 'en'
        ? 'No explicit academic goal notes were recorded in sealed sessions during this period.'
        : 'لم تُسجَّل ملاحظات أكاديمية صريحة في الجلسات المختومة خلال هذه الفترة.';
  } else if (highlights.length === 1) {
    summary =
      lang === 'en'
        ? `One sealed session captured educational progress observations for this period.`
        : `جلسة مختومة واحدة رصدت تقدماً تعليمياً خلال هذه الفترة.`;
  } else {
    summary =
      lang === 'en'
        ? `${highlights.length} sealed sessions documented educational and skill-building progress across ${groupBySpecialist(academicSessions).length} specialist(s).`
        : `${highlights.length} جلسة مختومة وثّقت التقدم الأكاديمي والمهاري عبر ${groupBySpecialist(academicSessions).length} أخصائي/ة.`;
  }

  return { summary, highlights, bySpecialist, sessionCount: academicSessions.length };
}

function buildBehavioralSection(sessions, lang) {
  const behavioralSessions = sessions.filter((s) => {
    const c = classifyNote(s.notes);
    return c.behavioral || (!c.academic && s.notes);
  });

  const observations = behavioralSessions
    .filter((s) => s.notes)
    .map((s) => ({
      date: s.sessionDate,
      specialist: s.specialistName,
      text: s.notes,
    }));

  const bySpecialist = groupBySpecialist(behavioralSessions).map(({ specialistName, sessions: items }) => ({
    specialistName,
    sessionCount: items.length,
    notes: items.filter((i) => i.notes).map((i) => ({ date: i.sessionDate, text: i.notes })),
  }));

  let summary;
  if (observations.length === 0) {
    summary =
      lang === 'en'
        ? 'No behavioral or emotional observations were captured in sealed claims for this period.'
        : 'لم تُسجَّل ملاحظات سلوكية أو انفعالية في المطالبات المختومة خلال هذه الفترة.';
  } else {
    const stableHint = observations.some((o) => /هدو|استقر|تحس|calm|stable|improv/i.test(o.text));
    summary =
      lang === 'en'
        ? stableHint
          ? `Behavioral monitoring across ${observations.length} session note(s) indicates periods of regulation and observable emotional patterns.`
          : `Behavioral and emotional patterns were documented across ${observations.length} sealed session note(s).`
        : stableHint
          ? `رصد سلوكي عبر ${observations.length} ملاحظة جلسة يُظهر فترات من التنظيم وأنماطاً انفعالية قابلة للملاحظة.`
          : `وُثّقت أنماط سلوكية وانفعالية عبر ${observations.length} ملاحظة في جلسات مختومة.`;
  }

  return { summary, observations, bySpecialist, sessionCount: behavioralSessions.length };
}

function buildRecommendations(sessions, period, lang) {
  const explicit = sessions
    .filter((s) => classifyNote(s.notes).recommendation && s.notes)
    .map((s) => ({
      date: s.sessionDate,
      specialist: s.specialistName,
      text: s.notes,
    }));

  const items = [];
  const count = sessions.length;

  if (explicit.length > 0) {
    for (const e of explicit) {
      items.push({
        source: 'specialist',
        specialist: e.specialist,
        text:
          lang === 'en'
            ? `[${e.specialist}, ${e.date}] ${e.text}`
            : `[${e.specialist} — ${e.date}] ${e.text}`,
      });
    }
  }

  if (count >= 3) {
    items.push({
      source: 'engine',
      text:
        lang === 'en'
          ? 'Maintain a consistent home routine aligned with session days to reinforce skills transferred from the center.'
          : 'حافظوا على روتين منزلي ثابت متوافق مع أيام الجلسات لتعزيز المهارات المنقولة من المركز.',
    });
  } else if (count > 0) {
    items.push({
      source: 'engine',
      text:
        lang === 'en'
          ? 'Increase session frequency if possible — regular contact supports skill consolidation and behavioral stability.'
          : 'يُفضَّل زيادة انتظام الجلسات إن أمكن — التواصل المنتظم يدعم ترسيخ المهارات والاستقرار السلوكي.',
    });
  }

  items.push({
    source: 'engine',
    text:
      lang === 'en'
        ? 'Share daily observations with the assigned specialist before the next sealed session for continuity of care.'
        : 'شاركوا ملاحظاتكم اليومية مع الأخصائي/ة المعيّن قبل الجلسة المختومة التالية لضمان استمرارية الرعاية.',
  });

  if (period === REPORT_PERIODS.MONTHLY) {
    items.push({
      source: 'engine',
      text:
        lang === 'en'
          ? 'Review monthly progress with the center coordinator and adjust home goals based on sealed session trends.'
          : 'راجعوا التقدم الشهري مع منسق المركز وعدّلوا الأهداف المنزلية وفق اتجاهات الجلسات المختومة.',
    });
  }

  const summary =
    lang === 'en'
      ? `${items.length} guidance item(s) for home follow-up during this ${period} reporting window.`
      : `${items.length} توصية/إرشاد للمتابعة المنزلية خلال نافذة التقرير ${period === REPORT_PERIODS.MONTHLY ? 'الشهرية' : 'الأسبوعية'}.`;

  return { summary, items, explicitCount: explicit.length };
}

/**
 * Compose a professional performance report from raw sealed session records.
 */
export function composePerformanceReport({
  studentName,
  period = REPORT_PERIODS.WEEKLY,
  startDate,
  endDate,
  sessions = [],
  lang = 'ar',
}) {
  const sorted = sortSessions(sessions);
  const range = startDate && endDate ? { startDate, endDate } : computeDateRange(period);

  return {
    meta: {
      studentName,
      period,
      periodLabel: periodLabel(period, lang),
      startDate: range.startDate,
      endDate: range.endDate,
      generatedAt: new Date().toISOString(),
      sessionCount: sorted.length,
      specialists: [...new Set(sorted.map((s) => s.specialistName).filter(Boolean))],
      dataSource: 'tblDailySessions (Sealed Claims)',
      lang,
    },
    academicProgress: buildAcademicSection(sorted, lang),
    behavioralStability: buildBehavioralSection(sorted, lang),
    recommendations: buildRecommendations(sorted, period, lang),
    sessions: sorted,
  };
}

/** Fetch sealed claims and compose full report. */
export async function generateStudentPerformanceReport({
  studentName,
  period = REPORT_PERIODS.WEEKLY,
  lang = 'ar',
  referenceDate,
}) {
  const range = computeDateRange(period, referenceDate ? new Date(referenceDate) : new Date());
  const records = await fetchSealedClaimsForStudent({
    studentName,
    startDate: range.startDate,
    endDate: range.endDate,
  });
  const sessions = (Array.isArray(records) ? records : []).map(mapSealedClaim);
  return composePerformanceReport({
    studentName,
    period,
    startDate: range.startDate,
    endDate: range.endDate,
    sessions,
    lang,
  });
}

/** Flat text export for print / clipboard. */
export function formatReportAsText(report, lang = 'ar') {
  if (!report) return '';
  const { meta, academicProgress, behavioralStability, recommendations } = report;
  const isAr = lang === 'ar';
  const lines = [];

  lines.push(isAr ? '═══════════════════════════════════════' : '═══════════════════════════════════════');
  lines.push(isAr ? '   تقرير الأداء — منصة عونك السيادية' : '   Performance Report — Aunak Sovereign Platform');
  lines.push(isAr ? '═══════════════════════════════════════' : '═══════════════════════════════════════');
  lines.push('');
  lines.push(isAr ? `الطالب: ${meta.studentName}` : `Student: ${meta.studentName}`);
  lines.push(
    isAr
      ? `الفترة: ${meta.periodLabel} (${meta.startDate} → ${meta.endDate})`
      : `Period: ${meta.periodLabel} (${meta.startDate} → ${meta.endDate})`
  );
  lines.push(isAr ? `عدد الجلسات المختومة: ${meta.sessionCount}` : `Sealed sessions: ${meta.sessionCount}`);
  lines.push('');

  lines.push(isAr ? '── التقدم الأكاديمي والمهاري ──' : '── Academic & Skill Progress ──');
  lines.push(academicProgress.summary);
  for (const h of academicProgress.highlights) {
    lines.push(`  • [${h.date}] ${h.specialist}: ${h.text}`);
  }
  lines.push('');

  lines.push(isAr ? '── الاستقرار السلوكي والانفعالي ──' : '── Behavioral & Emotional Stability ──');
  lines.push(behavioralStability.summary);
  for (const o of behavioralStability.observations) {
    lines.push(`  • [${o.date}] ${o.specialist}: ${o.text}`);
  }
  lines.push('');

  lines.push(isAr ? '── التوصيات المستقبلية ──' : '── Future Recommendations ──');
  lines.push(recommendations.summary);
  for (const item of recommendations.items) {
    lines.push(`  • ${item.text}`);
  }
  lines.push('');
  lines.push(isAr ? '— مصدر البيانات: جلسات مختومة (Sealed Claims) —' : '— Data source: Sealed Claims —');

  return lines.join('\n');
}
````

## File: src/lib/research.js
````javascript
/**
 * Aunak Research Center — data anonymization & sovereign safeguards.
 *
 * Pipeline: vital tables → anonymizeForResearch() (PII filter) →
 * smartCensorAudit() (الرقيب الذكي) → display / AES-256-GCM export.
 *
 * A dedicated AunakResearchHub table can be plugged into
 * RESEARCH_SOURCES once its table ID exists in Airtable.
 */

import { AIRTABLE_TABLES } from "./airtableTables";

/** Vital tables feeding the national research atlas. */
export const RESEARCH_SOURCES = [
  { key: "students", tableId: AIRTABLE_TABLES.students, ar: "السجل الحيوي", en: "Vital Registry" },
  { key: "emotion", tableId: AIRTABLE_TABLES.emotionalMonitoring, ar: "الرصد العاطفي", en: "Emotional Monitoring" },
  { key: "learning", tableId: AIRTABLE_TABLES.learningDifficulties, ar: "صعوبات التعلم", en: "Learning Difficulties" },
  { key: "behavior", tableId: AIRTABLE_TABLES.abcData, ar: "تحليل السلوك ABC", en: "ABC Behavior" },
];

/* ------------------------------------------------------------------ */
/* PII Filter                                                           */
/* ------------------------------------------------------------------ */

/** Field names that may carry personal identity — always dropped. */
const PII_KEY_PATTERN =
  /اسم|name|email|بريد|phone|هاتف|جوال|واتس|whats|address|عنوان|سكن|كود|code|رمز|token|password|سر|هوية|بطاقة|ولي|والد|parent|guardian|user|مستخدم|photo|صورة|وجه|face|رابط|link|url|attachment|مرفق|تواصل|contact|ميلاد|birth/i;

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.]+/;
const PHONE_RE = /(?:\+?\d[\s\u0660-\u0669-]?){8,}/;
const RECORD_ID_RE = /\brec[a-zA-Z0-9]{14}\b/;

/** Deterministic anonymous case ID (no way back to the Airtable record). */
function makeAnonId(recordId, index) {
  const seed = String(recordId ?? index);
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return `AUN-RS-${String((h % 9000) + 1000)}${String.fromCharCode(65 + (h % 26))}`;
}

function sanitizeValue(value) {
  if (value == null) return null;
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (EMAIL_RE.test(value) || PHONE_RE.test(value) || RECORD_ID_RE.test(value)) return null;
    return value;
  }
  if (Array.isArray(value)) {
    const clean = value
      .map((v) => sanitizeValue(v))
      .filter((v) => v != null && typeof v !== "object");
    return clean.length > 0 ? clean : null;
  }
  // Formula/attachment objects are dropped entirely.
  return null;
}

/**
 * Strip all personal identity from raw Airtable records, keeping only the
 * vital indicators (scores, categories, clinical measures) for analysis.
 */
export function anonymizeForResearch(records, sourceKey = "vital") {
  const list = Array.isArray(records) ? records : [];
  return list.map((record, index) => {
    const indicators = {};
    for (const [key, raw] of Object.entries(record?.fields ?? {})) {
      if (PII_KEY_PATTERN.test(key)) continue;
      const value = sanitizeValue(raw);
      if (value != null) indicators[key] = value;
    }
    return { anonId: makeAnonId(record?.id, index), source: sourceKey, indicators };
  });
}

/* ------------------------------------------------------------------ */
/* الرقيب الذكي — Smart Censor                                          */
/* ------------------------------------------------------------------ */

/**
 * Final audit pass over anonymized rows: serializes every row and scans
 * for any residual identity leak. Flagged rows are reported (and should
 * be dropped) before anything is displayed or exported.
 */
export function smartCensorAudit(rows) {
  const flags = [];
  for (const row of rows ?? []) {
    const text = JSON.stringify(row.indicators ?? {});
    if (EMAIL_RE.test(text)) flags.push({ anonId: row.anonId, reason: "email" });
    else if (PHONE_RE.test(text)) flags.push({ anonId: row.anonId, reason: "phone" });
    else if (RECORD_ID_RE.test(text)) flags.push({ anonId: row.anonId, reason: "record-id" });
  }
  return {
    passed: flags.length === 0,
    flags,
    scanned: rows?.length ?? 0,
  };
}

/** Drop any row the censor flagged — absolute privacy guarantee. */
export function applyCensor(rows) {
  const { flags } = smartCensorAudit(rows);
  if (flags.length === 0) return rows;
  const blocked = new Set(flags.map((f) => f.anonId));
  return rows.filter((r) => !blocked.has(r.anonId));
}

/* ------------------------------------------------------------------ */
/* AES-256-GCM Export — see sovereignCrypto.js                          */
/* ------------------------------------------------------------------ */

export { encryptForExport } from "./sovereignCrypto";
````

## File: src/lib/settlementEngine.js
````javascript
import {
  createSealedSessionClaim,
  getDailyReconciliation,
  syncLedgerToClaimCount,
  fetchDailyClaimsForDate,
  DAILY_SESSION_FIELDS as DS,
} from './airtable';
import { signSessionSettlement, hashSessionClaim } from './specialistAttestation';
import { verifyAun4611SessionAttestation } from './goalEngine';

export const CLAIM_STATUS = {
  DRAFT: 'Draft',
  SEALED: 'Sealed',
  DISPUTED: 'Disputed',
  REJECTED: 'Rejected',
};

/** Next session sequence number for specialist on a given date. */
export async function nextSessionSequence(sessionDate, specialistEmail, specialistName) {
  const claims = await fetchDailyClaimsForDate(sessionDate, specialistEmail, specialistName);
  const sealed = (claims || []).filter(
    (c) => String(c?.fields?.[DS.claimStatus] ?? '').trim() === CLAIM_STATUS.SEALED
  );
  return sealed.length + 1;
}

/** Verify specialist PIN against Access Control record (last 4 of token or Settlement PIN field). */
export function verifySpecialistPin(accessRecord, pin) {
  const p = String(pin ?? '').trim();
  if (!p || p.length < 4) return false;
  const f = accessRecord?.fields ?? accessRecord ?? {};
  const settlementPin =
    f['Settlement PIN'] ?? f['رمز التسوية'] ?? f['PIN'] ?? f['Specialist PIN'];
  if (settlementPin != null && String(settlementPin).trim() === p) return true;
  const token =
    f['Private Access Token'] ?? f['رمز الوصول الخاص'] ?? f['Access Token'] ?? '';
  const t = String(token).trim();
  if (t.length >= 4 && t.slice(-4) === p) return true;
  return false;
}

/**
 * Seal session: sign, hash, write claim to tblDailySessions, sync ledger.
 */
export async function sealSessionClaim({
  user,
  activeStudent,
  specialistEmail,
  sessionDate,
  sessionFee,
  notes,
  pinVerified,
}) {
  const attestation = verifyAun4611SessionAttestation({ user, activeStudent });
  const specialistName = user?.name ?? '';
  const sequence = await nextSessionSequence(sessionDate, specialistEmail, specialistName);

  const claimDraft = {
    sessionDate,
    studentId: activeStudent.id,
    studentName: activeStudent.name,
    sessionFee: Number(sessionFee) || 0,
    sequence,
    pinVerified,
  };

  const signature = await signSessionSettlement(user, claimDraft);
  const immutableHash = await hashSessionClaim(signature.payload, signature.signature);

  await createSealedSessionClaim({
    specialistEmail,
    specialistName,
    studentId: activeStudent.id,
    studentName: activeStudent.name,
    sessionFee: Number(sessionFee) || 0,
    notes,
    sessionDate,
    sequence,
    signature,
    immutableHash,
    aunAttestation: attestation.verified ? 'AUN-4611' : null,
    aunAttestationAt: attestation.attendanceAt ?? new Date().toISOString(),
    pinVerified,
  });

  await syncLedgerToClaimCount(sessionDate, specialistEmail, specialistName);
  return getDailyReconciliation(sessionDate, specialistEmail, specialistName);
}

/** True when claim record is sealed and must not be mutated. */
export function isClaimSealed(fields) {
  return String(fields?.[DS.claimStatus] ?? '').trim() === CLAIM_STATUS.SEALED;
}

/** Validate sealed row integrity against Immutable Hash field. */
export function verifySealedRow(fields) {
  if (!isClaimSealed(fields)) return { valid: false, reason: 'not_sealed' };
  const hash = fields?.[DS.immutableHash];
  const sig = fields?.[DS.specialistSignature];
  if (!hash || !sig) return { valid: false, reason: 'missing_hash_or_signature' };
  return { valid: true, hash, signature: sig };
}
````

## File: src/lib/sovereignCrypto.js
````javascript
/**
 * Sovereign AES-256-GCM — shared crypto for sessions, research, and attachments.
 */

export const CRYPTO_FORMAT = "AUNAK-AES256GCM";
export const RESEARCH_CRYPTO_FORMAT = "AUNAK-RESEARCH-AES256GCM";

function bufToHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function bufToBase64(buf) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function base64ToBuf(b64) {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function importKeyFromSession(user) {
  const seed = String(
    user?.dynamicSessionId ?? user?.childCode ?? user?.activeStudentId ?? "aunak-sovereign"
  );
  const data = new TextEncoder().encode(seed.padEnd(32, "0").slice(0, 32));
  return crypto.subtle.importKey("raw", data, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
}

/** Encrypt arbitrary text payload — returns JSON string for Airtable storage. */
export async function encryptSessionPayload(plaintext, user, format = CRYPTO_FORMAT) {
  if (plaintext == null || plaintext === "") return "";
  const key = await importKeyFromSession(user);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(String(plaintext));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return JSON.stringify({
    format,
    encryptedAt: new Date().toISOString(),
    iv: bufToBase64(iv),
    ciphertext: bufToBase64(ciphertext),
  });
}

/** Decrypt session payload stored as JSON string. */
export async function decryptSessionPayload(cipherJson, user) {
  if (!cipherJson) return "";
  try {
    const pkg = typeof cipherJson === "string" ? JSON.parse(cipherJson) : cipherJson;
    if (!pkg?.ciphertext || !pkg?.iv) return String(cipherJson);
    const key = await importKeyFromSession(user);
    const iv = base64ToBuf(pkg.iv);
    const ciphertext = base64ToBuf(pkg.ciphertext);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ciphertext);
    return new TextDecoder().decode(plain);
  } catch {
    return String(cipherJson);
  }
}

/** Encrypt research export with one-time key (original research hub flow). */
export async function encryptForExport(payload) {
  const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  const rawKey = await crypto.subtle.exportKey("raw", key);

  const fileText = JSON.stringify(
    {
      format: RESEARCH_CRYPTO_FORMAT,
      exportedAt: new Date().toISOString(),
      iv: bufToBase64(iv),
      ciphertext: bufToBase64(ciphertext),
    },
    null,
    2
  );

  return { fileText, keyHex: bufToHex(rawKey) };
}

export { bufToHex, bufToBase64 };
````

## File: src/lib/sovereignLogin.js
````javascript
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
````

## File: src/lib/sovereignMasterBypass.js
````javascript
/**
 * Sovereign dev master bypass — skips anti-spoof duplicate face block (94.7%).
 * For authorized team testing only (parent UI, enrollment QA).
 *
 * Activate via:
 *   - URL: ?master=AUNAK-MASTER-2026
 *   - sessionStorage after validateMasterKey()
 * Optional override: VITE_AUNAK_MASTER_KEY in .env.local
 */

export const SOVEREIGN_MASTER_KEY_DEFAULT = 'AUNAK-MASTER-2026';
const BYPASS_LS = 'aunak.sovereignMasterBypass.v1';

function expectedMasterKey() {
  const fromEnv = import.meta.env.VITE_AUNAK_MASTER_KEY;
  const key = fromEnv != null && String(fromEnv).trim() !== '' ? fromEnv : SOVEREIGN_MASTER_KEY_DEFAULT;
  return normalizeMasterKey(key);
}

export function normalizeMasterKey(raw) {
  return String(raw ?? '').trim().toUpperCase().replace(/\s+/g, '');
}

export function validateMasterKey(key) {
  return normalizeMasterKey(key) === expectedMasterKey();
}

export function activateMasterBypass(key) {
  if (!validateMasterKey(key)) return false;
  try {
    sessionStorage.setItem(BYPASS_LS, expectedMasterKey());
  } catch {
    /* ignore */
  }
  return true;
}

export function clearMasterBypass() {
  try {
    sessionStorage.removeItem(BYPASS_LS);
  } catch {
    /* ignore */
  }
}

export function isMasterBypassActive() {
  try {
    const stored = sessionStorage.getItem(BYPASS_LS);
    if (stored && stored === expectedMasterKey()) return true;
  } catch {
    /* ignore */
  }
  return false;
}

/** Call once on app boot — reads ?master= from URL and activates if valid. */
export function bootstrapMasterBypassFromUrl() {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('master') ?? params.get('sovereign_master');
  if (!raw) return false;
  const ok = activateMasterBypass(raw);
  if (ok) {
    params.delete('master');
    params.delete('sovereign_master');
    const qs = params.toString();
    const next = `${window.location.pathname}${qs ? `?${qs}` : ''}${window.location.hash}`;
    window.history.replaceState({}, '', next);
  }
  return ok;
}

export function masterBypassLabel() {
  return expectedMasterKey();
}
````

## File: src/lib/sovereignProtocol.js
````javascript
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
````

## File: src/lib/sovereignVoice.js
````javascript
/**
 * Sovereign voice I/O — Web Speech API foundation for supervisor commands.
 */

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

