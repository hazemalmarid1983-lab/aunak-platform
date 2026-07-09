/** Luxury Cyber Dark — single source of truth for Aunak UI tokens */
export const LUX = {
  page: "min-h-screen bg-[#0a0a0c] text-slate-300 font-sans",
  pageFlex: "min-h-screen bg-[#0a0a0c] text-slate-300 font-sans flex flex-col",
  pageWrap:
    "relative min-h-screen bg-[#0a0a0c] text-slate-300 font-sans overflow-hidden",
  pageWrapGradient:
    "pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(201,169,98,0.08)_0%,transparent_50%),radial-gradient(ellipse_at_80%_100%,rgba(52,211,153,0.06)_0%,transparent_50%)]",

  glass:
    "bg-[#12121a]/70 backdrop-blur-xl border border-white/[0.08] shadow-[0_0_40px_rgba(201,169,98,0.08)]",
  glassCard:
    "p-6 md:p-8 rounded-3xl bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 text-slate-300 shadow-[0_0_48px_rgba(201,169,98,0.1)] transition-all",
  glassHoverGold:
    "hover:border-[#c9a962]/45 hover:shadow-[0_0_32px_rgba(201,169,98,0.18)]",
  glassHoverEmerald:
    "hover:border-emerald-400/45 hover:shadow-[0_0_32px_rgba(52,211,153,0.16)]",

  titleGradient:
    "text-2xl md:text-3xl font-bold bg-gradient-to-l from-[#e8c872] via-[#d4af37] to-[#c9a962] bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(201,169,98,0.25)]",
  headingGold:
    "text-lg md:text-xl font-bold bg-gradient-to-l from-[#e8c872] to-[#c9a962] bg-clip-text text-transparent",
  subtitle: "text-xs md:text-sm text-slate-500 mt-1 font-mono",
  bodyText: "text-sm text-slate-300 leading-relaxed",
  muted: "text-slate-500",

  emeraldAccent: "text-emerald-400",
  emeraldValue: "text-emerald-300 font-mono",
  emeraldBadge:
    "inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-medium",
  goldText: "text-[#e8c872]",
  goldMono: "font-mono text-[#e8c872]",

  input:
    "w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] text-slate-300 font-mono focus:border-emerald-400/45 focus:outline-none focus:ring-1 focus:ring-emerald-400/25 disabled:opacity-50 placeholder:text-slate-600",
  btnGold:
    "px-6 py-3 rounded-xl bg-gradient-to-r from-[#c9a962] to-[#d4af37] font-bold text-[#0a0a0c] hover:shadow-[0_0_32px_rgba(201,169,98,0.28)] transition-all disabled:opacity-50 disabled:cursor-not-allowed",
  btnEmerald:
    "px-6 py-3 rounded-xl bg-emerald-500 text-[#0a0a0c] font-bold hover:shadow-[0_0_32px_rgba(52,211,153,0.28)] transition-all disabled:opacity-50",
  btnGhost:
    "px-4 py-2 rounded-xl bg-[#12121a]/50 border border-white/[0.08] text-slate-300 hover:border-[#c9a962]/35 hover:text-[#e8c872] transition-all",

  borderGold: "border-[#c9a962]/20",
  borderSubtle: "border-white/[0.06]",

  navActiveGold:
    "bg-[#c9a962]/14 text-[#e8c872] border border-[#c9a962]/40 shadow-[0_0_28px_rgba(201,169,98,0.16)]",
  navActiveLive:
    "bg-emerald-500/10 text-emerald-300 border border-emerald-400/35 shadow-[0_0_28px_rgba(52,211,153,0.16)]",
  navIdle:
    "text-slate-400 hover:bg-[#12121a]/55 hover:border-[#c9a962]/25 border border-transparent backdrop-blur-xl",

  headerBar:
    "p-6 md:p-8 border-b border-[#c9a962]/20 bg-[#12121a]/55 backdrop-blur-xl",
  aside:
    "w-72 bg-[#0d0d10]/95 backdrop-blur-xl flex flex-col z-10 shadow-2xl border-[#c9a962]/15",
  footer:
    "p-6 border-t border-[#c9a962]/15 flex items-center justify-between text-xs text-slate-500 font-mono bg-[#0d0d10]/95 backdrop-blur-xl",

  errorRose:
    "text-rose-300 bg-rose-500/10 border border-rose-400/35 rounded-xl px-4 py-3",

  /* Hub shell */
  root: "relative flex h-screen bg-[#0a0a0c] text-slate-300 font-sans overflow-hidden",
  main: "flex-1 min-h-0 overflow-y-auto bg-[#0a0a0c] relative z-0",
  contentColumn: "flex-1 flex flex-col min-w-0 min-h-0 relative z-0",
  asideShell:
    "relative z-20 flex flex-col h-full min-h-0 w-72 shrink-0 bg-[#0d0d10]/95 backdrop-blur-xl shadow-2xl",
  asideShellCollapsed: "w-14",
  asideBorderAr: "border-l border-[#c9a962]/25",
  asideBorderEn: "border-r border-[#c9a962]/25",
  sovereignTopBar:
    "shrink-0 z-30 flex items-center justify-between gap-3 px-4 py-2.5 border-b border-[#c9a962]/20 bg-[#12121a]/75 backdrop-blur-xl",
  sovereignTopBarCompact: "px-3 py-2",
  sovereignControls:
    "flex items-center gap-1.5 sm:gap-2 shrink-0",
  sovereignIconBtn:
    "p-2 rounded-lg border border-white/[0.06] bg-[#12121a]/60 backdrop-blur-xl text-slate-400 hover:text-[#e8c872] hover:border-[#c9a962]/35 transition-all",
  sovereignIconBtnActive: "text-emerald-400 border-emerald-400/30 bg-emerald-500/10",
  sovereignLogoutBtn:
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#e8c872] bg-[#12121a]/60 backdrop-blur-xl border border-[#c9a962]/40 hover:border-[#e8c872]/50 hover:shadow-[0_0_20px_rgba(201,169,98,0.18)] transition-all",
  sovereignOnlineBadge:
    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-400/25",
  sovereignRevealBtn:
    "fixed bottom-4 z-40 p-3 rounded-full bg-[#12121a]/90 backdrop-blur-xl border border-[#c9a962]/35 text-[#e8c872] shadow-[0_0_24px_rgba(201,169,98,0.2)] hover:border-emerald-400/40 transition-all",
  navArea: "flex-1 min-h-0 overflow-y-auto p-3 space-y-1.5",
  userCardCompact:
    "flex items-center gap-2.5 p-2.5 mx-3 mt-3 rounded-xl bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15",
  headerSection:
    "p-6 border-b border-[#c9a962]/20 flex flex-col items-center text-center gap-4 bg-[#12121a]/55 backdrop-blur-xl",
  headerSectionCompact:
    "shrink-0 p-3 border-b border-[#c9a962]/20 flex flex-col items-center text-center gap-1.5 bg-[#12121a]/55 backdrop-blur-xl",
  hubTitleGradient:
    "text-xl font-bold bg-gradient-to-l from-[#e8c872] via-[#d4af37] to-[#c9a962] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(201,169,98,0.2)]",
  userCard:
    "flex items-center gap-3 p-3 rounded-xl bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 mb-3",
  sovereignBadge:
    "inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-[#e8c872] bg-[#c9a962]/12 border border-[#c9a962]/30 px-2 py-0.5 rounded backdrop-blur-xl",
  langBtn:
    "w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#12121a]/55 backdrop-blur-xl border border-white/[0.08] text-slate-300 hover:text-[#e8c872] hover:border-[#c9a962]/40 hover:shadow-[0_0_28px_rgba(201,169,98,0.14)] transition-all font-bold text-sm",
  navLocked: "text-slate-600 hover:bg-[#12121a]/40 border border-transparent",
  lockIcon: "text-[#c9a962]/70",
  logoFocus:
    "min-h-[44px] min-w-[44px] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a962]/45 shrink-0",
  audioOn: "text-emerald-400 hover:bg-emerald-500/10",
  audioOff: "text-slate-600 hover:bg-[#12121a]/50",

  /* Gate-specific */
  encryptedBadge:
    "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-400/30 backdrop-blur-xl text-emerald-300 text-sm font-medium",
  panelGlass:
    "max-w-lg w-full bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 rounded-3xl p-8 text-center shadow-[0_0_48px_rgba(201,169,98,0.1)]",
  videoFrame:
    "relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden border border-white/[0.08] bg-[#0d0d10] mb-6",
  scanProgress: "text-emerald-300 text-sm font-mono",
  formGlass:
    "max-w-md w-full bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 rounded-3xl p-8 shadow-[0_0_48px_rgba(201,169,98,0.1)]",
  formHeading:
    "text-lg font-bold bg-gradient-to-l from-[#e8c872] to-[#c9a962] bg-clip-text text-transparent",
  enrollmentBar:
    "p-4 border-b border-[#c9a962]/20 bg-[#12121a]/55 backdrop-blur-xl space-y-3",
  enrollmentInput:
    "w-full px-3 py-2 rounded-lg bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 font-mono text-sm text-[#e8c872] focus:border-emerald-400/40 focus:outline-none",
  backMuted: "text-slate-500 text-sm inline-flex items-center gap-2",
  backLink: "mt-6 text-xs text-slate-500",
  enterParentBtn: "mt-4 px-8 py-3 rounded-xl bg-emerald-500 text-[#0a0a0c] font-bold",

  logoutBtn:
    "w-full flex items-center justify-center gap-2 py-2.5 mb-3 rounded-xl text-sm font-bold text-[#e8c872] bg-[#12121a]/60 backdrop-blur-xl border border-[#c9a962]/45 hover:border-[#e8c872]/50 hover:shadow-[0_0_28px_rgba(201,169,98,0.22),0_0_16px_rgba(244,63,94,0.06)] transition-all",
  navScroll: "lux-nav-scroll",
  gateCardTitle:
    "text-lg font-bold bg-gradient-to-l from-[#e8c872] to-[#c9a962] bg-clip-text text-transparent",
  harmonyPending: "text-[#c9a962]",
  eyeMapCellEmpty: "rounded-sm bg-white/[0.04] border border-white/[0.06]",
  eyeMapCellActive: "rounded-sm bg-gradient-to-br from-[#c9a962] to-emerald-400",
  pillarGold:
    "border-[#c9a962]/30 bg-[#12121a]/70 backdrop-blur-xl hover:border-[#c9a962]/50 shadow-[0_0_24px_rgba(201,169,98,0.06)]",
  pillarEmerald:
    "border-emerald-400/30 bg-[#12121a]/70 backdrop-blur-xl hover:border-emerald-400/50 shadow-[0_0_24px_rgba(52,211,153,0.06)]",
  pillarMuted:
    "border-[#c9a962]/18 bg-[#12121a]/55 backdrop-blur-xl hover:border-[#c9a962]/35 shadow-[0_0_20px_rgba(201,169,98,0.04)]",

  /* Aliases */
  cardGlass:
    "p-8 rounded-3xl bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 text-center transition-all shadow-[0_0_48px_rgba(201,169,98,0.1)]",
  cardGoldHover:
    "hover:border-[#c9a962]/45 hover:shadow-[0_0_32px_rgba(201,169,98,0.18)]",
  cardEmeraldHover:
    "hover:border-emerald-400/45 hover:shadow-[0_0_32px_rgba(52,211,153,0.16)]",
  header:
    "p-6 md:p-8 border-b border-[#c9a962]/20 bg-[#12121a]/55 backdrop-blur-xl",
  inputGlass:
    "w-full px-4 py-3 rounded-xl bg-[#0d0d10]/90 border border-white/[0.08] mb-4 font-mono text-center text-slate-300 focus:border-emerald-400/45 focus:outline-none focus:ring-1 focus:ring-emerald-400/25 disabled:opacity-50",
  submitGold:
    "w-full py-3 rounded-xl bg-gradient-to-r from-[#c9a962] to-[#d4af37] font-bold text-[#0a0a0c] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_32px_rgba(201,169,98,0.28)] transition-all",
  scanBtnEmerald:
    "px-8 py-3 rounded-xl bg-emerald-500 text-[#0a0a0c] font-bold hover:shadow-[0_0_32px_rgba(52,211,153,0.28)] transition-all",
  childCodeMono: "font-mono text-[#e8c872]",
};

/** Panel wrapper used across feature screens */
export function luxScreen(className = "") {
  return `${LUX.page} p-4 md:p-6 ${className}`.trim();
}

export function luxCard(className = "") {
  return `${LUX.glassCard} ${className}`.trim();
}
