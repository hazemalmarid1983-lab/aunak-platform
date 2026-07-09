/**
 * Sovereign voice I/O — Web Speech API foundation for supervisor commands.
 */

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export function isSpeechRecognitionSupported() {
  return Boolean(SpeechRecognition);
}

export function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function createSpeechRecognition({ lang = "ar-SA", continuous = false, interimResults = false } = {}) {
  if (!SpeechRecognition) return null;
  const rec = new SpeechRecognition();
  rec.lang = lang;
  rec.continuous = continuous;
  rec.interimResults = interimResults;
  return rec;
}

export function speakText(text, { lang = "ar-SA", rate = 1 } = {}) {
  if (!isSpeechSynthesisSupported() || !text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(String(text));
  utter.lang = lang;
  utter.rate = rate;
  window.speechSynthesis.speak(utter);
}

const NAV_COMMANDS = {
  ar: [
    { patterns: [/السجل|سجل حي|live/i], section: "live" },
    { patterns: [/تقييم|تشخيص|diagnostic/i], section: "diagnostics" },
    { patterns: [/جزر|وسائط|media/i], section: "media" },
    { patterns: [/جلسات|registry/i], section: "registry" },
    { patterns: [/تحكم|override|يدوي/i], action: "manualOverride" },
    { patterns: [/سجل ملاحظة[:：]?\s*(.+)/i], action: "dictateNote", capture: 1 },
  ],
  en: [
    { patterns: [/live registry|go live/i], section: "live" },
    { patterns: [/assessment|diagnostic/i], section: "diagnostics" },
    { patterns: [/island|media/i], section: "media" },
    { patterns: [/session registry|registry/i], section: "registry" },
    { patterns: [/manual override|override/i], action: "manualOverride" },
    { patterns: [/note[:：]?\s*(.+)/i], action: "dictateNote", capture: 1 },
  ],
};

/** Parse sovereign voice command from transcript. */
export function parseSovereignCommand(transcript, lang = "ar") {
  const text = String(transcript ?? "").trim();
  if (!text) return null;

  const rules = NAV_COMMANDS[lang] ?? NAV_COMMANDS.ar;
  for (const rule of rules) {
    for (const pattern of rule.patterns) {
      const match = text.match(pattern);
      if (!match) continue;
      if (rule.section) return { type: "navigate", section: rule.section, raw: text };
      if (rule.action === "manualOverride") return { type: "manualOverride", raw: text };
      if (rule.action === "dictateNote") {
        return { type: "dictateNote", text: match[rule.capture] ?? text, raw: text };
      }
    }
  }
  return { type: "unknown", raw: text };
}
