import { useCallback, useEffect, useRef, useState } from 'react';
import { ACADEMY_MOODS } from '../lib/academyTheme';
import { playSuccessChime, canPlaySovereignAudio } from '../lib/sovereignAudio';

const CELEBRATE_MS = 1500;

export function useAcademyMood({ initial = ACADEMY_MOODS.idle } = {}) {
  const [mood, setMoodState] = useState(initial);
  const timerRef = useRef(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const setMood = useCallback(
    (next, { autoIdleMs } = {}) => {
      clearTimer();
      setMoodState(next);
      if (autoIdleMs != null) {
        timerRef.current = setTimeout(() => setMoodState(ACADEMY_MOODS.idle), autoIdleMs);
      }
    },
    [clearTimer]
  );

  const toIdle = useCallback(() => setMood(ACADEMY_MOODS.idle), [setMood]);
  const toThinking = useCallback(() => setMood(ACADEMY_MOODS.thinking), [setMood]);
  const toChallenge = useCallback(() => setMood(ACADEMY_MOODS.challenge), [setMood]);

  const celebrate = useCallback(() => {
    setMood(ACADEMY_MOODS.celebrate, { autoIdleMs: CELEBRATE_MS });
    if (canPlaySovereignAudio()) playSuccessChime();
  }, [setMood]);

  return {
    mood,
    setMood,
    toIdle,
    toThinking,
    toChallenge,
    celebrate,
    isCelebrate: mood === ACADEMY_MOODS.celebrate,
  };
}
