import { AlertTriangle } from "lucide-react";

/** Luxury Cyber Dark — shared data-grid tokens */
export const ST = {
  shell:
    "overflow-x-auto w-full border border-slate-800/50 rounded-xl scrollbar-thin scrollbar-thumb-amber-500/20",
  table: "w-full text-sm border-collapse",
  thead: "bg-slate-950/80 backdrop-blur-md",
  th: "py-4 px-6 text-start text-[10px] uppercase font-bold tracking-[0.18em] text-amber-500/80 border-b border-amber-500/10 whitespace-nowrap",
  tbody: "divide-y divide-slate-800/60",
  tr: "border-b border-slate-800/60 transition-all duration-200 ease-in-out hover:bg-neutral-900/80 hover:border-amber-500/30",
  trAlt: "bg-neutral-900/40",
  trBase: "bg-neutral-950",
  td: "py-4 px-6 text-neutral-200 align-middle",
  tdMuted: "py-4 px-6 text-neutral-400 align-middle",
  listRow:
    "p-5 bg-neutral-950 rounded-2xl border border-slate-800/60 flex justify-between items-center transition-all duration-200 ease-in-out hover:bg-neutral-900/80 hover:border-amber-500/30",
  listRowAlt: "bg-neutral-900/40",
};

const BADGE_BASE =
  "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap transition-all duration-200 ease-in-out";

const BADGE_VARIANTS = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  draft: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  locked: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  sealed: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  live: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  open: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  muted: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  riskHigh: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  riskMid: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  riskLow: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
};

function normalizeStatusKey(raw) {
  const s = String(raw ?? "")
    .trim()
    .toLowerCase();
  if (!s) return "muted";
  if (
    ["active", "نشط", "paid", "مكتمل", "completed", "verified", "approved", "live"].some((k) =>
      s.includes(k)
    )
  ) {
    return s.includes("live") || s === "live" ? "live" : "active";
  }
  if (["draft", "drafts", "مسودة", "pending", "بانتظار", "open", "مفتوحة", "new", "جديد"].some((k) => s.includes(k))) {
    if (s.includes("open") || s.includes("مفتوح")) return "open";
    return "draft";
  }
  if (["locked", "sealed", "مقفلة", "مقفول", "ختم", "immutable"].some((k) => s.includes(k))) {
    return s.includes("seal") || s.includes("ختم") || s.includes("مقفلة") ? "sealed" : "locked";
  }
  return "muted";
}

/**
 * Unified glow status badge — active / draft / locked|sealed
 */
export function StatusBadge({ status, label, variant, className = "" }) {
  const key = variant || normalizeStatusKey(status);
  const tone = BADGE_VARIANTS[key] || BADGE_VARIANTS.muted;
  const text = label ?? (status != null && status !== "" ? String(status) : "—");
  return <span className={`${BADGE_BASE} ${tone} ${className}`.trim()}>{text}</span>;
}

export function RiskBadge({ score, className = "" }) {
  const n = Number(score);
  const variant = !Number.isFinite(n) ? "muted" : n >= 70 ? "riskHigh" : n >= 40 ? "riskMid" : "riskLow";
  return (
    <StatusBadge
      variant={variant}
      label={Number.isFinite(n) ? String(n) : "—"}
      className={className}
    />
  );
}

/**
 * Truncated cell with matte-black hover tooltip for long tokens / notes / JSON keys.
 */
export function TruncateTooltip({
  text,
  maxWidthClass = "max-w-[12rem]",
  className = "",
  muted = false,
}) {
  const value = text == null || text === "" ? "—" : String(text);
  const isEmpty = value === "—";
  return (
    <span
      className={`group/tip relative inline-block ${maxWidthClass} ${className}`.trim()}
      title={isEmpty ? undefined : value}
    >
      <span
        className={`block truncate ${muted ? "text-neutral-400" : "text-neutral-200"}`}
      >
        {value}
      </span>
      {!isEmpty && (
        <span
          role="tooltip"
          className="pointer-events-none absolute z-40 bottom-full start-1/2 -translate-x-1/2 mb-2 hidden group-hover/tip:block max-w-xs whitespace-pre-wrap break-all rounded-lg border border-amber-500/20 bg-neutral-950 px-3 py-2 text-[11px] font-mono text-neutral-200 shadow-[0_8px_32px_rgba(0,0,0,0.65)]"
        >
          {value}
        </span>
      )}
    </span>
  );
}

/**
 * Premium empty-state card for zero live records.
 */
export function TableEmptyState({
  lang = "ar",
  message,
  className = "",
}) {
  const fallback =
    lang === "en"
      ? "No live records available to display"
      : "لا توجد سجلات حية لعرضها حالياً";
  return (
    <div
      className={`flex flex-col items-center justify-center text-center py-14 px-6 rounded-xl border border-amber-500/15 bg-neutral-950/80 backdrop-blur-md ${className}`.trim()}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-amber-500/25 bg-amber-500/10">
        <AlertTriangle className="h-7 w-7 text-amber-400" strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium tracking-wide text-amber-400/90">
        {message ?? fallback}
      </p>
    </div>
  );
}

export function SovereignTableShell({ children, className = "" }) {
  return <div className={`${ST.shell} ${className}`.trim()}>{children}</div>;
}

export function SovereignTable({ children, className = "" }) {
  return <table className={`${ST.table} ${className}`.trim()}>{children}</table>;
}

export function SovereignThead({ children }) {
  return <thead className={ST.thead}>{children}</thead>;
}

export function SovereignTh({ children, className = "" }) {
  return <th className={`${ST.th} ${className}`.trim()}>{children}</th>;
}

export function SovereignTr({ children, index = 0, className = "" }) {
  const zebra = index % 2 === 1 ? ST.trAlt : ST.trBase;
  return <tr className={`${ST.tr} ${zebra} ${className}`.trim()}>{children}</tr>;
}

export function SovereignTd({ children, muted = false, className = "", colSpan }) {
  return (
    <td colSpan={colSpan} className={`${muted ? ST.tdMuted : ST.td} ${className}`.trim()}>
      {children}
    </td>
  );
}
