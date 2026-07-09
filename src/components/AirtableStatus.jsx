import { Loader2 } from "lucide-react";
import { TableEmptyState } from "./ui/SovereignTable.jsx";

const statusText = {
  ar: {
    loading: "جاري التحميل من Airtable...",
    empty: "لا توجد سجلات حية لعرضها حالياً",
  },
  en: {
    loading: "Loading from Airtable...",
    empty: "No live records available to display",
  },
};

export function AirtableLoading({ lang = "ar", message }) {
  const t = statusText[lang] ?? statusText.ar;
  return (
    <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-3 min-h-full bg-[#0a0a0c] text-slate-300">
      <Loader2 className="w-8 h-8 animate-spin text-amber-500/50" />
      <p className="text-sm font-mono text-neutral-400">{message ?? t.loading}</p>
    </div>
  );
}

export function AirtableErrorBanner({ error }) {
  if (!error) return null;
  return (
    <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
      {error}
    </div>
  );
}

export function AirtableEmpty({ lang = "ar", message }) {
  const t = statusText[lang] ?? statusText.ar;
  return <TableEmptyState lang={lang} message={message ?? t.empty} />;
}
