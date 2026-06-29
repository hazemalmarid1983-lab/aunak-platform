import { useCallback, useEffect, useRef } from 'react';

const PROMO_SCRIPT = {
  ar: `ولي الأمر الكريم…
طفلك يحمل قدرات حقيقية… لكن بدون التقييم الشامل الكامل، تبقى نصف الصورة مخفية.
التقييم الشامل في عونك يختصر أشهراً من التخمين… ويمنحك خطة تأهيل دقيقة… مبنية على بيانات… لا على ظنون.
لا تترك فرصة طفلك للصدفة… فعّل الباقة الشاملة… وابدأ اليوم.`,
  en: `Dear parent…
Your child has real abilities — but without the full comprehensive assessment, half the picture stays hidden.
Aunak's full assessment saves months of guessing and delivers a precise rehabilitation plan built on data, not assumptions.
Don't leave your child's future to chance — activate the full plan and start today.`,
};

export function usePromoVoice(lang = 'ar') {
  const speakingRef = useRef(false);

  const stop = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    speakingRef.current = false;
  }, []);

  const speak = useCallback(
    (text) => {
      if (typeof window === 'undefined' || !window.speechSynthesis) return;
      stop();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = lang === 'en' ? 'en-US' : 'ar-SA';
      utter.rate = 0.82;
      utter.pitch = 0.75;
      utter.volume = 1;
      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.lang.startsWith(lang === 'en' ? 'en' : 'ar') &&
          (/male|google|natural/i.test(v.name) || v.localService === false)
      );
      if (preferred) utter.voice = preferred;
      utter.onend = () => {
        speakingRef.current = false;
      };
      speakingRef.current = true;
      window.speechSynthesis.speak(utter);
    },
    [lang, stop]
  );

  const speakPromo = useCallback(() => {
    speak(PROMO_SCRIPT[lang] ?? PROMO_SCRIPT.ar);
  }, [lang, speak]);

  useEffect(() => () => stop(), [stop]);

  return { speak, speakPromo, stop, isSupported: typeof window !== 'undefined' && 'speechSynthesis' in window };
}

export { PROMO_SCRIPT };
