import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, Volume2, Star, ArrowRight, Crown, Waves } from 'lucide-react';
import { findStudentByEnglishToken, parseEnglishRouteToken } from '../lib/englishAccess';
import {
  ENGLISH_PHRASE_BANK,
  accuracyTier,
  createEnglishRecognizer,
  isSpeechRecognitionSupported,
  saveEnglishSpokenResult,
  scorePronunciation,
} from '../lib/englishIslandEngine';
import {
  enqueueAcademySpeech,
  scriptWelcome,
  unlockAcademyVoice,
} from '../lib/academyVoice';
import {
  playStarDrop,
  playSuccessChime,
  playTaDaFanfare,
  startProcessingHum,
} from '../lib/sovereignAudio';

const MAX_STARS = 5;

/**
 * English Talk Island — isolated pronunciation track.
 * ?token=AUN-ENG-… unlocks the live speaking games interface: the guide speaks
 * a target phrase (cloud/web TTS), the student repeats it aloud (Web Speech
 * recognition), accuracy is scored live and streamed back to Airtable.
 *
 * Royal identity: matte gold (#c9a962 · #e8c872) + neon emerald on charcoal (#0a0a0c).
 */
export default function EnglishTalkIsland() {
  const [lang, setLang] = useState('en');
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);
  const [error, setError] = useState('');

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const [heard, setHeard] = useState('');
  const [accuracy, setAccuracy] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [stars, setStars] = useState(0);
  const [burst, setBurst] = useState(false);
  const [speechSupported] = useState(() => isSpeechRecognitionSupported());

  const recognizerRef = useRef(null);
  const humRef = useRef(null);
  const welcomedRef = useRef(false);
  const burstTimerRef = useRef(null);

  const phrase = ENGLISH_PHRASE_BANK[phraseIndex] ?? ENGLISH_PHRASE_BANK[0];
  const rtl = lang === 'ar';

  const t = rtl
    ? {
        title: 'جزيرة تحدُّث الإنجليزية',
        subtitle: 'ذهب · زمرد · نطق سيادي حي',
        loading: 'تهيئة جزيرة النطق…',
        badToken: 'رمز الإنجليزية مفقود في الرابط (?token=AUN-ENG-…)',
        invalid: 'رمز غير صالح أو غير مفعّل',
        conn: 'خطأ في الاتصال',
        say: 'انطق هذه العبارة',
        listen: 'استمع',
        speak: 'تحدَّث الآن',
        listening: 'أستمع إليك…',
        next: 'العبارة التالية',
        accuracy: 'دقة النطق',
        youSaid: 'قلتَ',
        noSpeech: 'المتصفح لا يدعم التعرف على الكلام — استخدم Chrome',
        stars: 'نجوم',
      }
    : {
        title: 'English Talk Island',
        subtitle: 'Gold · Emerald · Live sovereign speech',
        loading: 'Initializing speech island…',
        badToken: 'Missing English token in URL (?token=AUN-ENG-…)',
        invalid: 'Invalid or inactive English token',
        conn: 'Connection error',
        say: 'Say this phrase',
        listen: 'Listen',
        speak: 'Speak now',
        listening: 'Listening to you…',
        next: 'Next phrase',
        accuracy: 'Pronunciation accuracy',
        youSaid: 'You said',
        noSpeech: 'This browser does not support speech recognition — use Chrome',
        stars: 'Stars',
      };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = parseEnglishRouteToken();

      // Demo mode (?demo=1 or token AUN-ENG-DEMO): try the island with no cloud
      // setup — pure client speech/scoring, nothing written to Airtable.
      const params =
        typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const demo =
        params?.get('demo') === '1' || /^AUN-ENG-DEMO/i.test(String(token ?? ''));
      if (demo) {
        const demoName = params?.get('name')?.trim();
        setStudent({ id: null, name: demoName || 'Maryam', demo: true });
        setLoading(false);
        return;
      }

      if (!token) {
        setError(t.badToken);
        setLoading(false);
        return;
      }
      try {
        const row = await findStudentByEnglishToken(token);
        if (cancelled) return;
        if (!row) setError(t.invalid);
        else setStudent(row);
      } catch {
        if (!cancelled) setError(t.conn);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!student) return undefined;
    humRef.current = startProcessingHum();
    const unlock = () => unlockAcademyVoice();
    document.addEventListener('pointerdown', unlock, { once: true, passive: true });
    return () => {
      humRef.current?.stop?.();
      document.removeEventListener('pointerdown', unlock);
    };
  }, [student]);

  useEffect(() => {
    if (!student || welcomedRef.current) return;
    welcomedRef.current = true;
    const firstName = student.name?.split(' ')?.[0] ?? student.name ?? '';
    unlockAcademyVoice();
    enqueueAcademySpeech(scriptWelcome(firstName, 'en'), { lang: 'en', preferCloud: true });
  }, [student]);

  useEffect(
    () => () => {
      recognizerRef.current?.abort?.();
      if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
    },
    []
  );

  const speakTarget = useCallback(() => {
    unlockAcademyVoice();
    enqueueAcademySpeech(phrase.text, { lang: 'en', preferCloud: true });
  }, [phrase.text]);

  const fireStar = useCallback(() => {
    setStars((n) => {
      const next = Math.min(MAX_STARS, n + 1);
      if (next > n) {
        playStarDrop();
        setBurst(true);
        playTaDaFanfare();
        if (burstTimerRef.current) clearTimeout(burstTimerRef.current);
        burstTimerRef.current = setTimeout(() => setBurst(false), 2600);
      }
      return next;
    });
  }, []);

  const grade = useCallback(
    (transcript) => {
      const score = scorePronunciation(transcript, phrase.text);
      const tier = accuracyTier(score);
      setHeard(transcript);
      setAccuracy(score);
      setFeedback(rtl ? tier.ar : tier.en);
      if (tier.star) {
        fireStar();
      } else {
        playSuccessChime();
      }
      saveEnglishSpokenResult(student?.id, { spokenText: transcript, accuracy: score });
    },
    [phrase.text, rtl, fireStar, student?.id]
  );

  const startListening = useCallback(() => {
    if (!speechSupported || listening) return;
    unlockAcademyVoice();
    const rec = createEnglishRecognizer();
    if (!rec) return;
    recognizerRef.current = rec;
    setInterim('');
    setHeard('');
    setAccuracy(null);
    setFeedback('');

    let finalText = '';
    rec.onresult = (event) => {
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const res = event.results[i];
        if (res.isFinal) finalText += res[0].transcript;
        else interimText += res[0].transcript;
      }
      setInterim(interimText);
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => {
      setListening(false);
      setInterim('');
      const spoken = finalText.trim();
      if (spoken) grade(spoken);
    };
    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
    }
  }, [speechSupported, listening, grade]);

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop?.();
  }, []);

  const nextPhrase = useCallback(() => {
    setPhraseIndex((i) => (i + 1) % ENGLISH_PHRASE_BANK.length);
    setHeard('');
    setInterim('');
    setAccuracy(null);
    setFeedback('');
  }, []);

  const accentBar = 'bg-[radial-gradient(ellipse_at_20%_0%,rgba(201,169,98,0.12)_0%,transparent_55%),radial-gradient(ellipse_at_80%_100%,rgba(52,211,153,0.1)_0%,transparent_55%)]';

  if (loading) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0c] text-slate-300 font-sans flex items-center justify-center overflow-hidden">
        <div className={`pointer-events-none absolute inset-0 ${accentBar}`} />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-emerald-400" />
          <p className="font-bold text-[#e8c872]">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="relative min-h-screen bg-[#0a0a0c] text-slate-300 font-sans flex items-center justify-center overflow-hidden p-6">
        <div className={`pointer-events-none absolute inset-0 ${accentBar}`} />
        <div className="relative z-10 max-w-md w-full text-center rounded-3xl bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 p-8 shadow-[0_0_48px_rgba(201,169,98,0.1)]">
          <Crown className="w-10 h-10 mx-auto mb-4 text-[#c9a962]/70" />
          <p className="text-lg font-bold text-rose-300">{error}</p>
        </div>
      </div>
    );
  }

  const firstName = student.name?.split(' ')?.[0] ?? student.name;
  const accColor =
    accuracy == null
      ? 'text-slate-500'
      : accuracy >= 70
        ? 'text-emerald-300'
        : accuracy >= 45
          ? 'text-[#e8c872]'
          : 'text-rose-300';

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="relative min-h-screen bg-[#0a0a0c] text-slate-300 font-sans overflow-hidden"
    >
      <div className={`pointer-events-none absolute inset-0 ${accentBar}`} />

      {burst && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
          <Star className="w-28 h-28 animate-ping opacity-80 text-[#e8c872]" />
        </div>
      )}

      <header className="relative z-10 p-6 border-b border-[#c9a962]/20 bg-[#12121a]/55 backdrop-blur-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-[#c9a962]/12 border border-[#c9a962]/30">
            <Crown className="w-6 h-6 text-[#e8c872]" />
          </div>
          <div className={rtl ? 'text-right' : 'text-left'}>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-l from-[#e8c872] via-[#d4af37] to-[#c9a962] bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(201,169,98,0.25)]">
              {t.title}
            </h1>
            <p className="text-[11px] font-bold text-emerald-400/90">{t.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {student?.demo && (
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full bg-[#c9a962]/12 border border-[#c9a962]/30 text-[#e8c872] text-[10px] font-bold uppercase tracking-wider">
              {rtl ? 'عرض تجريبي' : 'Demo'}
            </span>
          )}
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-mono">
            {t.stars} {stars}/{MAX_STARS}
          </span>
          <button
            type="button"
            onClick={() => setLang((l) => (l === 'en' ? 'ar' : 'en'))}
            className="px-3 py-1.5 rounded-full font-bold text-sm bg-[#12121a]/80 border border-[#c9a962]/30 text-[#e8c872] hover:border-emerald-400/40 transition-all"
          >
            {lang === 'en' ? 'ع' : 'EN'}
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 md:py-12 flex flex-col items-center gap-8">
        <p className="text-sm text-slate-400">
          {rtl ? `أهلاً ${firstName} — ` : `Welcome ${firstName} — `}
          <span className="text-emerald-300">{phrase.hint}</span>
        </p>

        <section className="w-full rounded-3xl bg-[#12121a]/70 backdrop-blur-xl border border-[#c9a962]/15 p-8 text-center shadow-[0_0_48px_rgba(201,169,98,0.1)]">
          <p className="text-xs uppercase tracking-widest text-[#c9a962]/70 mb-4 font-mono">{t.say}</p>
          <p className="text-3xl md:text-4xl font-bold text-slate-100 leading-relaxed">
            {phrase.text}
          </p>

          <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={speakTarget}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#c9a962] to-[#d4af37] font-bold text-[#0a0a0c] hover:shadow-[0_0_32px_rgba(201,169,98,0.28)] transition-all"
            >
              <Volume2 className="w-5 h-5" />
              {t.listen}
            </button>

            <button
              type="button"
              onClick={listening ? stopListening : startListening}
              disabled={!speechSupported}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                listening
                  ? 'bg-rose-500 text-[#0a0a0c] shadow-[0_0_32px_rgba(244,63,94,0.35)] animate-pulse'
                  : 'bg-emerald-500 text-[#0a0a0c] hover:shadow-[0_0_32px_rgba(52,211,153,0.28)]'
              }`}
            >
              <Mic className="w-5 h-5" />
              {listening ? t.listening : t.speak}
            </button>
          </div>

          {!speechSupported && (
            <p className="mt-4 text-xs text-rose-300 bg-rose-500/10 border border-rose-400/30 rounded-xl px-4 py-2">
              {t.noSpeech}
            </p>
          )}

          {(interim || listening) && (
            <p className="mt-5 text-sm text-slate-400 font-mono min-h-[1.25rem] flex items-center justify-center gap-2">
              <Waves className="w-4 h-4 text-emerald-400 animate-pulse" />
              {interim || '…'}
            </p>
          )}
        </section>

        {accuracy != null && (
          <section className="w-full rounded-3xl bg-[#12121a]/70 backdrop-blur-xl border border-emerald-400/20 p-6 shadow-[0_0_40px_rgba(52,211,153,0.1)]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-emerald-300/80 font-mono">
                {t.accuracy}
              </span>
              <span className={`text-2xl font-bold font-mono ${accColor}`}>{accuracy}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-[#0d0d10] overflow-hidden border border-white/[0.06]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#c9a962] to-emerald-400 transition-all duration-700"
                style={{ width: `${accuracy}%` }}
              />
            </div>
            {feedback && (
              <p className={`mt-3 text-center font-bold ${accColor}`}>{feedback}</p>
            )}
            {heard && (
              <p className="mt-2 text-center text-xs text-slate-500 font-mono">
                {t.youSaid}: “{heard}”
              </p>
            )}
          </section>
        )}

        <button
          type="button"
          onClick={nextPhrase}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#12121a]/50 border border-white/[0.08] text-slate-300 hover:border-[#c9a962]/35 hover:text-[#e8c872] transition-all"
        >
          {t.next}
          <ArrowRight className={`w-4 h-4 ${rtl ? 'rotate-180' : ''}`} />
        </button>
      </main>
    </div>
  );
}
