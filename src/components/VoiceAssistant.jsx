import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, MicOff } from 'lucide-react';
import {
  createSpeechRecognition,
  isSpeechRecognitionSupported,
} from '../lib/sovereignVoice';

/**
 * Voice-to-Clinical — free Web Speech API mic that returns Arabic transcript.
 * Parent injects text into clinical notes via onTranscript.
 */
export default function VoiceAssistant({
  lang = 'ar',
  onTranscript,
  disabled = false,
}) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');
  const recRef = useRef(null);
  const supported = isSpeechRecognitionSupported();
  const speechLang = lang === 'en' ? 'en-US' : 'ar-SA';

  const stop = useCallback(() => {
    try {
      recRef.current?.stop?.();
    } catch {
      /* ignore */
    }
    recRef.current = null;
    setListening(false);
  }, []);

  useEffect(() => () => stop(), [stop]);

  const start = useCallback(() => {
    if (disabled || !supported) {
      setError(
        lang === 'en'
          ? 'Speech recognition is not available in this browser.'
          : 'التعرّف على الكلام غير متاح في هذا المتصفح.'
      );
      return;
    }

    setError('');
    const rec = createSpeechRecognition({
      lang: speechLang,
      continuous: false,
      interimResults: false,
    });
    if (!rec) {
      setError(lang === 'en' ? 'Could not start microphone.' : 'تعذر تشغيل الميكروفون.');
      return;
    }

    recRef.current = rec;

    rec.onresult = (event) => {
      const transcript = String(event.results?.[0]?.[0]?.transcript ?? '').trim();
      if (transcript) onTranscript?.(transcript);
    };

    rec.onerror = () => {
      setError(lang === 'en' ? 'Listening error — try again.' : 'خطأ في الاستماع — أعد المحاولة.');
      setListening(false);
      recRef.current = null;
    };

    rec.onend = () => {
      setListening(false);
      recRef.current = null;
    };

    try {
      rec.start();
      setListening(true);
    } catch {
      setError(lang === 'en' ? 'Microphone start failed.' : 'فشل تشغيل الميكروفون.');
      setListening(false);
      recRef.current = null;
    }
  }, [disabled, supported, speechLang, lang, onTranscript]);

  const toggle = () => {
    if (listening) stop();
    else start();
  };

  const label = listening
    ? lang === 'en'
      ? 'Listening…'
      : 'جاري الاستماع…'
    : lang === 'en'
      ? 'Dictate notes'
      : 'توثيق صوتي';

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <button
        type="button"
        onClick={toggle}
        disabled={disabled || !supported}
        title={label}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 ${
          listening
            ? 'bg-rose-500/20 border-rose-400/50 text-rose-200 animate-pulse'
            : 'bg-[#12121a]/70 border-[#c9a962]/35 text-[#e8c872] hover:border-[#e8c872]/50'
        }`}
      >
        {listening ? (
          <>
            <MicOff className="w-4 h-4" />
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </>
        ) : (
          <Mic className="w-4 h-4" />
        )}
        {label}
      </button>
      {error ? <p className="text-[10px] text-rose-400 max-w-[12rem] text-end">{error}</p> : null}
      {!supported ? (
        <p className="text-[10px] text-slate-600 max-w-[12rem] text-end">
          {lang === 'en' ? 'Web Speech API required' : 'يتطلب Web Speech API'}
        </p>
      ) : null}
    </div>
  );
}
