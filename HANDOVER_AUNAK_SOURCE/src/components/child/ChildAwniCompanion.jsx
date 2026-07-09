import { motion, AnimatePresence } from 'framer-motion';
import { useMeltdownPredictor } from '../../hooks/useMeltdownPredictor';

const CALM_LINES = {
  ar: ['أنا عوني 🌟', 'أنت بطل!', 'يلا نكمل!', 'رائع جداً!'],
  en: ['I am Awni 🌟', 'You are a champion!', 'Let us continue!', 'Amazing!'],
};

const SILENT_LINES = {
  ar: '🤫 … نتنفس بهدوء',
  en: '🤫 … calm breath',
};

export default function ChildAwniCompanion({ lang = 'ar', active = true, lineIndex = 0 }) {
  const { meltdownRisk, onPointerActivity } = useMeltdownPredictor({ active, lang });
  const lines = CALM_LINES[lang] ?? CALM_LINES.ar;
  const line = meltdownRisk ? (SILENT_LINES[lang] ?? SILENT_LINES.ar) : lines[lineIndex % lines.length];

  return (
    <div
      className="flex flex-col items-center gap-3"
      onPointerDown={() => onPointerActivity('down')}
      onPointerUp={() => onPointerActivity('up')}
    >
      <motion.div
        animate={
          meltdownRisk
            ? { scale: 0.92, rotate: 0 }
            : { scale: [1, 1.04, 1], rotate: [0, 2, -2, 0] }
        }
        transition={{ duration: meltdownRisk ? 0.4 : 2.5, repeat: meltdownRisk ? 0 : Infinity }}
        className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl border-4 ${
          meltdownRisk
            ? 'bg-[#12121a] border-[#c9a962]/30 shadow-none'
            : 'bg-gradient-to-br from-[#c9a962] to-emerald-500 border-[#e8c872]/40 shadow-[0_0_32px_rgba(52,211,153,0.3)]'
        }`}
      >
        {meltdownRisk ? '🤫' : '🤖'}
      </motion.div>
      <AnimatePresence mode="wait">
        <motion.p
          key={line}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={
            meltdownRisk
              ? 'max-w-xs text-center px-5 py-3 rounded-3xl bg-[#0d0d10]/60 border border-[#c9a962]/20 text-[#c9a962]/80 text-sm font-bold'
              : 'max-w-xs text-center px-5 py-3 rounded-3xl bg-[#0d0d10]/90 border border-emerald-400/30 text-emerald-100 text-lg font-bold'
          }
        >
          {line}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
