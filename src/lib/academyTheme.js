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
