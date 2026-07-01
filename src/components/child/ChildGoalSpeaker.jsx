import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2, Sparkles } from 'lucide-react';
import { enqueueAcademySpeech, unlockAcademyVoice, cancelAcademySpeech } from '../../lib/academyVoice';
import { playGoalEcho } from '../../lib/sovereignAudio';

const EQ_BARS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Textless goal delivery — the child taps a big glowing speaker and HEARS the
 * specialist's programmed goal instead of reading it. Friendly cheerful voice.
 */
export default function ChildGoalSpeaker({ lang = 'ar', goalText, studentName }) {
  const [speaking, setSpeaking] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancelAcademySpeech();
    };
  }, []);

  const hasGoal = Boolean(goalText && goalText.trim());
  const firstName = studentName?.split?.(' ')?.[0] ?? studentName ?? '';

  const spoken = hasGoal
    ? `${firstName ? (lang === 'en' ? `${firstName}! ` : `${firstName}! `) : ''}${goalText.trim()}`
    : lang === 'en'
      ? `${firstName || 'Champion'}! Your challenge is coming very soon. Get ready!`
      : `${firstName || 'يا بطل'}! تحديك قادم قريباً جداً. استعد!`;

  const speak = () => {
    unlockAcademyVoice();
    playGoalEcho();
    setSpeaking(true);
    enqueueAcademySpeech(spoken, {
      lang,
      preferCloud: true,
      onEnd: () => {
        if (mountedRef.current) setSpeaking(false);
      },
    });
    // Safety: clear the speaking animation even if TTS silently no-ops.
    setTimeout(() => {
      if (mountedRef.current) setSpeaking(false);
    }, 12000);
  };

  const label = lang === 'en' ? 'Tap to hear your mission' : 'اضغط لتسمع مهمتك';

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      <motion.button
        type="button"
        onClick={speak}
        aria-label={label}
        whileTap={{ scale: 0.92 }}
        animate={speaking ? { scale: [1, 1.06, 1] } : { scale: 1 }}
        transition={{ duration: 0.8, repeat: speaking ? Infinity : 0 }}
        className="relative w-40 h-40 rounded-full bg-gradient-to-br from-[#c9a962] via-amber-400 to-emerald-400 flex items-center justify-center shadow-[0_0_48px_rgba(232,200,114,0.5)] active:shadow-[0_0_24px_rgba(232,200,114,0.35)]"
      >
        <span className="tawasul-ring absolute inset-0 rounded-full border-2 border-amber-200/60" />
        <span className="tawasul-ring-delay absolute inset-0 rounded-full border-2 border-emerald-300/50" />

        {speaking ? (
          <div className="flex items-end gap-1.5 h-16">
            {EQ_BARS.map((i) => (
              <span
                key={i}
                className="tawasul-eq-bar w-2.5 rounded-full bg-[#0a0a0c]/85"
                style={{ height: '100%', animationDelay: `${i * 0.09}s`, animationDuration: `${0.55 + (i % 3) * 0.12}s` }}
              />
            ))}
          </div>
        ) : (
          <Volume2 className="w-20 h-20 text-[#0a0a0c] drop-shadow" strokeWidth={2.4} />
        )}

        <span className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-[#0a0a0c] border-2 border-amber-300/70 flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-amber-300" />
        </span>
      </motion.button>

      <p className="text-sm font-black text-[#e8c872] tracking-wide">{label}</p>
    </div>
  );
}
