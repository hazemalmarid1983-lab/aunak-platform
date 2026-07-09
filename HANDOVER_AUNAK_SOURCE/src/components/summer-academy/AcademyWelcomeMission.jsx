import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { ACADEMY } from '../../lib/academyTheme';

export default function AcademyWelcomeMission({
  lang,
  mission,
  question,
  onStart,
  onAnswer,
  lastMessage,
  onReplay,
}) {
  if (!question) {
    return (
      <motion.div
        className={`${ACADEMY.card} text-center max-w-lg mx-auto`}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <motion.span
          className="text-6xl block mb-4"
          animate={{ y: [0, -12, 0] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        >
          🚀
        </motion.span>
        <h2 className={ACADEMY.title}>{mission.title}</h2>
        <p className={`${ACADEMY.subtitle} mb-6`}>{mission.subtitle}</p>
        {lastMessage && <p className="text-lg font-bold text-emerald-600 mb-4">{lastMessage}</p>}
        <button type="button" className={ACADEMY.btnPrimary} onClick={onStart}>
          {mission.start}
        </button>
      </motion.div>
    );
  }

  const step = mission.questions.indexOf(question);

  return (
    <motion.div
      className={`${ACADEMY.card} max-w-xl mx-auto`}
      key={step}
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-pink-500">
          {lang === 'ar' ? `🎮 ${step + 1}/${mission.questions.length}` : `🎮 ${step + 1}/${mission.questions.length}`}
        </span>
        <button
          type="button"
          onClick={() => onReplay?.(question.prompt)}
          className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200"
          aria-label={lang === 'ar' ? 'أعد السؤال' : 'Replay question'}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
      <p className="text-xl font-black text-slate-700 mb-6 text-center">{question.prompt}</p>
      <div className="grid gap-3">
        {question.options.map((opt, i) => (
          <motion.button
            key={opt}
            type="button"
            onClick={() => onAnswer(i)}
            className={ACADEMY.btnOption}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            {opt}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
