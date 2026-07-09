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
