import { useCallback, useEffect, useRef, useState } from "react";
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  parseSovereignCommand,
  speakText,
} from "../lib/sovereignVoice";

/**
 * Sovereign STT/TTS — armed only when biometricSovereign session is active.
 */
export function useSovereignVoice({ enabled, lang = "ar", onCommand }) {
  const [listening, setListening] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [error, setError] = useState("");
  const recRef = useRef(null);

  const speechLang = lang === "ar" ? "ar-SA" : "en-US";
  const supported = isSpeechRecognitionSupported();

  const stopListening = useCallback(() => {
    recRef.current?.stop?.();
    setListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (!enabled || !supported) {
      setError(lang === "ar" ? "التخاطب غير متاح" : "Voice not available");
      return;
    }
    setError("");
    const rec = createSpeechRecognition({ lang: speechLang, continuous: false });
    if (!rec) return;
    recRef.current = rec;

    rec.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? "";
      setLastTranscript(transcript);
      const cmd = parseSovereignCommand(transcript, lang);
      onCommand?.(cmd, transcript);
      if (cmd?.type === "navigate") {
        speakText(lang === "ar" ? `توجيه إلى ${cmd.section}` : `Navigating to ${cmd.section}`, { lang: speechLang });
      } else if (cmd?.type === "manualOverride") {
        speakText(lang === "ar" ? "تفعيل التحكم اليدوي" : "Manual override toggled", { lang: speechLang });
      }
    };

    rec.onerror = () => {
      setError(lang === "ar" ? "خطأ في الاستماع" : "Listening error");
      setListening(false);
    };

    rec.onend = () => setListening(false);

    rec.start();
    setListening(true);
  }, [enabled, supported, speechLang, lang, onCommand]);

  useEffect(() => () => stopListening(), [stopListening]);

  return {
    listening,
    lastTranscript,
    error,
    supported,
    ttsSupported: isSpeechSynthesisSupported(),
    startListening,
    stopListening,
    speak: (text) => speakText(text, { lang: speechLang }),
  };
}
