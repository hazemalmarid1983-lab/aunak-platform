import { Mic, MicOff, Loader2 } from "lucide-react";
import { useSovereignVoice } from "../hooks/useSovereignVoice";
import { LUX } from "../lib/luxTheme.js";

export default function SovereignCommandBar({ lang = "ar", enabled, onNavigate, onManualOverride, onDictateNote }) {
  const copy = {
    ar: {
      ready: "جاهز للتخاطب السيادي",
      listen: "استماع",
      stop: "إيقاف",
      secured: "محمي بيومترياً",
    },
    en: {
      ready: "Sovereign voice ready",
      listen: "Listen",
      stop: "Stop",
      secured: "Biometric secured",
    },
  }[lang] ?? { ready: "", listen: "", stop: "", secured: "" };

  const handleCommand = (cmd) => {
    if (!cmd) return;
    if (cmd.type === "navigate") onNavigate?.(cmd.section);
    if (cmd.type === "manualOverride") onManualOverride?.();
    if (cmd.type === "dictateNote") onDictateNote?.(cmd.text);
  };

  const voice = useSovereignVoice({
    enabled,
    lang,
    onCommand: handleCommand,
  });

  if (!enabled) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-400/25 bg-emerald-950/30 ${LUX.muted}`}>
      <span className="text-[10px] font-mono text-emerald-300 hidden lg:inline">{copy.ready}</span>
      <button
        type="button"
        onClick={voice.listening ? voice.stopListening : voice.startListening}
        disabled={!voice.supported}
        className={`${LUX.sovereignIconBtn} ${voice.listening ? LUX.sovereignIconBtnActive : ""}`}
        title={copy.secured}
      >
        {voice.listening ? <Loader2 className="w-4 h-4 animate-spin" /> : voice.supported ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4 opacity-50" />}
      </button>
      {voice.lastTranscript && (
        <span className="text-[10px] font-mono text-slate-400 max-w-[120px] truncate">{voice.lastTranscript}</span>
      )}
    </div>
  );
}
