/** Tawasul Sovereign Island — matte black · gold · emerald neon (child shell). */

export const TAWASUL_CHILD = {
  root: 'tawasul-child-root min-h-screen text-slate-200 font-sans overflow-hidden select-none bg-[#0a0a0c]',
  sky:
    'pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(201,169,98,0.12)_0%,transparent_45%),radial-gradient(ellipse_at_80%_90%,rgba(52,211,153,0.1)_0%,transparent_50%),linear-gradient(180deg,#0a0a0c 0%,#12121a 50%,#0a0a0c 100%)]',
  grid:
    'pointer-events-none fixed inset-0 opacity-[0.07] bg-[linear-gradient(rgba(201,169,98,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(201,169,98,0.4)_1px,transparent_1px)] bg-[size:48px_48px]',
  header:
    'relative z-20 px-4 py-3 flex items-center justify-between bg-[#12121a]/80 backdrop-blur-xl border-b border-[#c9a962]/20',
  main: 'relative z-10 max-w-lg mx-auto p-4 pb-28',
  card:
    'rounded-[2rem] p-6 bg-[#12121a]/90 backdrop-blur-xl border border-[#c9a962]/25 shadow-[0_0_48px_rgba(201,169,98,0.12),inset_0_0_32px_rgba(52,211,153,0.04)]',
  title:
    'text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#e8c872] via-[#d4af37] to-emerald-400',
  subtitle: 'text-sm font-bold text-emerald-400/90',
  btnPlay:
    'w-full py-5 rounded-[1.5rem] text-xl font-black text-[#0a0a0c] bg-gradient-to-r from-[#c9a962] to-emerald-400 shadow-[0_0_24px_rgba(52,211,153,0.25)] active:scale-[0.98] transition-transform',
  btnBubble:
    'absolute rounded-full font-black text-[#0a0a0c] shadow-[0_0_16px_rgba(201,169,98,0.35)] active:scale-90 transition-transform cursor-pointer border-2 border-[#e8c872]/60',
  mascotWrap: 'flex flex-col items-center gap-3',
  mascotFace:
    'w-28 h-28 rounded-full bg-gradient-to-br from-[#c9a962] to-emerald-500 border-4 border-[#e8c872]/40 shadow-[0_0_32px_rgba(52,211,153,0.3)] flex items-center justify-center text-5xl',
  speech:
    'max-w-xs text-center px-5 py-3 rounded-3xl bg-[#0d0d10]/90 border border-emerald-400/30 text-emerald-100 text-lg font-bold shadow-[0_0_20px_rgba(52,211,153,0.15)]',
  speechSilent:
    'max-w-xs text-center px-5 py-3 rounded-3xl bg-[#0d0d10]/60 border border-[#c9a962]/20 text-[#c9a962]/80 text-sm font-bold',
  islandArena:
    'relative h-64 rounded-3xl bg-gradient-to-b from-[#0d0d10] to-[#12121a] overflow-hidden border border-emerald-400/20 shadow-[inset_0_0_40px_rgba(52,211,153,0.08)]',
};

export const TAWASUL_BUBBLE_COLORS = [
  'from-[#c9a962] to-[#d4af37]',
  'from-emerald-400 to-teal-500',
  'from-[#e8c872] to-amber-500',
  'from-teal-400 to-emerald-600',
  'from-amber-400 to-[#c9a962]',
];
