/** Beneficiary interactive shell — bright sensory intervention theme. */

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
    'يلا نبدأ التدخل الحسي والتمكين!',
    'أنت رائع! استمر!',
    'يا سلام! استجابة صحيحة!',
  ],
  en: [
    'Hi champion! I am Awni 🌟',
    "Let's begin sensory intervention!",
    'You are amazing!',
    'Wow! Correct response!',
  ],
};

export const BUBBLE_COLORS = [
  'from-pink-400 to-rose-400',
  'from-sky-400 to-blue-400',
  'from-amber-400 to-orange-400',
  'from-emerald-400 to-teal-400',
  'from-violet-400 to-purple-400',
];
