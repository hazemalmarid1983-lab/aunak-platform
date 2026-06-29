import { useCallback, useEffect, useRef, useState } from 'react';
import {
  cancelAcademySpeech,
  enqueueAcademySpeech,
  isAcademyVoiceUnlocked,
  scriptAssessmentDone,
  scriptEncouragement,
  scriptTaskComplete,
  scriptWelcome,
  scriptWheelSpin,
  unlockAcademyVoice,
} from '../lib/academyVoice';

/**
 * Voice-First companion for Summer Academy (Nora / Nova).
 * Disabled in parent zone when muted=true.
 */
export function useAcademyVoice({ lang = 'ar', studentName, enabled = true, muted = false } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const activeRef = useRef(enabled && !muted);

  useEffect(() => {
    activeRef.current = enabled && !muted;
    if (muted) cancelAcademySpeech();
  }, [enabled, muted]);

  useEffect(() => () => cancelAcademySpeech(), []);

  const speak = useCallback(
    (text, opts = {}) => {
      if (!activeRef.current || !text) return;
      enqueueAcademySpeech(text, {
        lang,
        ...opts,
        onStart: () => {
          setIsSpeaking(true);
          opts.onStart?.();
        },
        onEnd: () => {
          setIsSpeaking(false);
          opts.onEnd?.();
        },
      });
    },
    [lang]
  );

  const unlock = useCallback(() => {
    unlockAcademyVoice();
  }, []);

  const onWelcomeStart = useCallback(() => {
    unlock();
    speak(scriptWelcome(studentName, lang));
  }, [studentName, lang, speak, unlock]);

  const onQuestionShown = useCallback(
    (question) => {
      if (question?.prompt) speak(question.prompt);
    },
    [speak]
  );

  const onAnswer = useCallback(() => {
    speak(scriptEncouragement(lang));
  }, [lang, speak]);

  const onTaskComplete = useCallback(() => {
    speak(scriptTaskComplete(lang));
  }, [lang, speak]);

  const onWheelSpin = useCallback(() => {
    speak(scriptWheelSpin(lang));
  }, [lang, speak]);

  const onAssessmentDone = useCallback(() => {
    speak(scriptAssessmentDone(lang));
  }, [lang, speak]);

  const replay = useCallback(
    (text) => {
      if (!isAcademyVoiceUnlocked()) unlock();
      speak(text);
    },
    [speak, unlock]
  );

  return {
    isSpeaking,
    unlock,
    speak,
    replay,
    cancel: cancelAcademySpeech,
    onWelcomeStart,
    onQuestionShown,
    onAnswer,
    onTaskComplete,
    onWheelSpin,
    onAssessmentDone,
  };
}
