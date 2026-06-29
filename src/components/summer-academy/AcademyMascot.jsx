import { motion } from 'framer-motion';

const EXPRESSIONS = {
  idle: { eyeScaleY: 1, mouth: 'M 38 58 Q 50 64 62 58', browY: 32 },
  talking: { eyeScaleY: 0.85, mouth: 'M 36 56 Q 50 68 64 56', browY: 31 },
  happy: { eyeScaleY: 0.6, mouth: 'M 34 54 Q 50 72 66 54', browY: 30 },
  wink: { eyeScaleY: 1, mouth: 'M 38 58 Q 50 66 62 58', browY: 32, wink: true },
  cheer: { eyeScaleY: 0.5, mouth: 'M 32 52 Q 50 76 68 52', browY: 28 },
};

export default function AcademyMascot({ expression = 'idle', isSpeaking = false, lang = 'ar' }) {
  const exp = EXPRESSIONS[isSpeaking ? 'talking' : expression] ?? EXPRESSIONS.idle;
  const name = lang === 'en' ? 'Nova' : 'نورا';

  return (
    <motion.div
      className="fixed bottom-4 end-4 z-40 flex flex-col items-center gap-1 pointer-events-none academy-mascot-shadow"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 18 }}
    >
      <motion.div
        animate={
          expression === 'cheer'
            ? { y: [0, -12, 0], rotate: [0, -5, 5, 0] }
            : isSpeaking
              ? { y: [0, -4, 0] }
              : { y: [0, -6, 0] }
        }
        transition={{
          repeat: Infinity,
          duration: expression === 'cheer' ? 0.6 : isSpeaking ? 0.35 : 2.5,
          ease: 'easeInOut',
        }}
        className="relative"
      >
        <svg width="100" height="110" viewBox="0 0 100 110" aria-hidden>
          <ellipse cx="50" cy="105" rx="28" ry="6" fill="rgba(0,0,0,0.08)" />
          <motion.g
            animate={expression === 'cheer' ? { rotate: [0, 8, -8, 0] } : {}}
            transition={{ repeat: Infinity, duration: 0.8 }}
            style={{ transformOrigin: '50px 55px' }}
          >
            <ellipse cx="50" cy="55" rx="38" ry="40" fill="#FFB347" />
            <ellipse cx="50" cy="58" rx="32" ry="34" fill="#FFC966" />
            <ellipse cx="28" cy="70" rx="10" ry="14" fill="#FFB347" transform="rotate(-20 28 70)" />
            <ellipse cx="72" cy="70" rx="10" ry="14" fill="#FFB347" transform="rotate(20 72 70)" />
            <circle cx="38" cy="48" r="6" fill="#fff" />
            <circle cx="62" cy="48" r="6" fill="#fff" />
            <motion.ellipse
              cx="38"
              cy="48"
              rx="3"
              ry={3 * exp.eyeScaleY}
              fill="#2d3748"
              animate={{ scaleY: exp.eyeScaleY }}
            />
            {exp.wink ? (
              <path d="M 56 48 Q 62 48 68 48" stroke="#2d3748" strokeWidth="2.5" fill="none" />
            ) : (
              <motion.ellipse
                cx="62"
                cy="48"
                rx="3"
                ry={3 * exp.eyeScaleY}
                fill="#2d3748"
                animate={{ scaleY: exp.eyeScaleY }}
              />
            )}
            <path d={exp.mouth} stroke="#e53e3e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <ellipse cx="30" cy="58" rx="6" ry="4" fill="#ffb8b8" opacity="0.5" />
            <ellipse cx="70" cy="58" rx="6" ry="4" fill="#ffb8b8" opacity="0.5" />
          </motion.g>
        </svg>
      </motion.div>
      <span className="text-xs font-black text-pink-600 bg-white/80 px-2 py-0.5 rounded-full shadow-sm">
        {name}
      </span>
    </motion.div>
  );
}
