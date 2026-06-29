import { motion } from 'framer-motion';
import { TrendingUp, AlertCircle, Sparkles, Target } from 'lucide-react';

const BAND_STYLE = {
  balanced: {
    ring: 'border-emerald-400/50',
    glow: 'shadow-[0_0_48px_rgba(52,211,153,0.25)]',
    icon: Sparkles,
    color: 'text-emerald-300',
  },
  moderate: {
    ring: 'border-amber-400/50',
    glow: 'shadow-[0_0_48px_rgba(251,191,36,0.25)]',
    icon: TrendingUp,
    color: 'text-amber-300',
  },
  elevated: {
    ring: 'border-rose-400/50',
    glow: 'shadow-[0_0_48px_rgba(251,113,133,0.3)]',
    icon: AlertCircle,
    color: 'text-rose-300',
  },
};

export default function AssessmentResultScreen({ lang = 'ar', result, studentName, onShowPromo }) {
  if (!result) return null;

  const style = BAND_STYLE[result.band] ?? BAND_STYLE.moderate;
  const Icon = style.icon;

  const copy =
    lang === 'en'
      ? {
          label: 'Preliminary result',
          for: 'For',
          score: 'Developmental focus index',
          disclaimer: 'Not a clinical diagnosis — a smart preliminary map.',
          cta: 'See how the full assessment changes everything',
        }
      : {
          label: 'النتيجة المبدئية',
          for: 'للطالب',
          score: 'مؤشر التركيز التطوري',
          disclaimer: 'ليست تشخيصاً سريرياً — خريطة مبدئية ذكية.',
          cta: 'اكتشف كيف يغيّر التقييم الشامل كل شيء',
        };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`max-w-lg mx-auto rounded-3xl border-2 ${style.ring} ${style.glow} bg-[#12121a]/80 backdrop-blur-xl p-6 md:p-8`}
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
    >
      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">{copy.label}</p>
      <h2 className="text-xl font-bold text-slate-200 mb-1">
        {copy.for}: <span className="text-[#e8c872]">{studentName}</span>
      </h2>
      <p className={`text-lg font-bold mb-6 ${style.color}`}>{result.title}</p>

      <div className="flex items-center justify-center gap-6 mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              className={style.color}
              strokeDasharray={`${(result.scorePercent / 100) * 264} 264`}
              initial={{ strokeDasharray: '0 264' }}
              animate={{ strokeDasharray: `${(result.scorePercent / 100) * 264} 264` }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-white">{result.scorePercent}</span>
            <span className="text-[10px] text-slate-500 font-mono">{copy.score}</span>
          </div>
        </div>
        <Icon className={`w-12 h-12 ${style.color}`} />
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-3">{result.summary}</p>
      <p className="text-sm text-emerald-300/90 mb-2 flex items-start gap-2">
        <Target className="w-4 h-4 shrink-0 mt-0.5" />
        {result.strengthsText}
      </p>
      <p className="text-sm text-amber-300/90 mb-4">{result.focusText}</p>
      <p className="text-xs text-slate-500 mb-6 font-mono">{copy.disclaimer}</p>

      <button
        type="button"
        onClick={onShowPromo}
        className="w-full py-4 rounded-2xl bg-gradient-to-l from-blue-600 to-violet-600 text-white font-bold text-lg hover:shadow-[0_0_40px_rgba(99,102,241,0.45)] transition-all animate-pulse"
      >
        {copy.cta}
      </button>
    </motion.div>
  );
}
