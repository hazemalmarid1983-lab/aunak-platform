import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Volume2, VolumeX, Crown, ArrowLeft, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import { usePromoVoice } from '../../hooks/usePromoVoice';
import PaymentCheckoutButton from '../PaymentCheckoutButton';

export default function AssessmentPromoModal({
  lang = 'ar',
  open,
  onContinue,
  onClose,
  studentId,
  customer,
  defaultPlan,
  flow = 'enrollment',
}) {
  const { speakPromo, stop, isSupported } = usePromoVoice(lang);
  const [muted, setMuted] = useState(false);
  const [scene, setScene] = useState(0);

  const copy =
    lang === 'en'
      ? {
          headline: 'The Full Picture Changes Everything',
          sub: 'Comprehensive assessment — not guesswork',
          bullets: [
            'Hidden strengths revealed in 48 hours',
            'Personalized rehab plan for your beneficiary',
            'Sovereign data — trusted by centers',
          ],
          cta: 'Continue with activation code',
          payOnline: 'Consultative License portal',
          payDivider: 'or enter admin code at next step',
          skip: 'Continue to activation',
          mute: 'Mute voice',
          unmute: 'Play voice',
          scenes: [
            'Every beneficiary has a hidden map…',
            'The free Developmental Screening Matrix shows the surface…',
            'The full assessment unlocks the path.',
          ],
        }
      : {
          headline: 'الصورة الكاملة… تغيّر كل شيء',
          sub: 'التقييم الشامل — لا تخمين ولا انتظار',
          bullets: [
            'كشف نقاط القوة المخفية خلال 48 ساعة',
            'خطة تأهيل شخصية للمستفيد',
            'بيانات سيادية معتمدة من المراكز',
          ],
          cta: 'متابعة بكود التفعيل',
          payOnline: 'بوابة تفعيل الرخص الاستشارية',
          payDivider: 'أو أدخل كود الإدارة في الخطوة التالية',
          skip: 'متابعة للتفعيل',
          mute: 'كتم الصوت',
          unmute: 'تشغيل الصوت الرنان',
          scenes: [
            'كل مستفيد يحمل خريطة قدرات…',
            'مقياس المسح النمائي الأولي يكشف السطح…',
            'التقييم الشامل يفتح الطريق.',
          ],
        };

  useEffect(() => {
    if (!open) {
      stop();
      setScene(0);
      return undefined;
    }
    if (!muted && isSupported) {
      const t = setTimeout(() => speakPromo(), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open, muted, isSupported, speakPromo, stop]);

  useEffect(() => {
    if (!open) return undefined;
    const interval = setInterval(() => setScene((s) => (s + 1) % copy.scenes.length), 2800);
    return () => clearInterval(interval);
  }, [open, copy.scenes.length]);

  const toggleMute = () => {
    if (muted) {
      setMuted(false);
      speakPromo();
    } else {
      setMuted(true);
      stop();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[#050508]/90 backdrop-blur-lg" onClick={onClose} aria-hidden />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative z-10 w-full max-w-2xl rounded-3xl overflow-hidden border border-[#c9a962]/40 shadow-[0_0_80px_rgba(201,169,98,0.35)]"
            initial={{ scale: 0.92, y: 24 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
          >
            {/* Cinematic "video" panel */}
            <div className="relative aspect-video bg-gradient-to-br from-[#1a0a2e] via-[#0f172a] to-[#1c1917] overflow-hidden">
              <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_50%_40%,rgba(201,169,98,0.45)_0%,transparent_55%)] animate-pulse" />
              <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(255,255,255,0.03)_2px,rgba(255,255,255,0.03)_4px)]" />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center px-8"
                key={scene}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Crown className="w-16 h-16 text-[#e8c872] mx-auto mb-4 drop-shadow-[0_0_24px_rgba(232,200,114,0.8)]" />
                <p className="text-2xl md:text-3xl font-black text-white leading-relaxed drop-shadow-lg">
                  {copy.scenes[scene]}
                </p>
              </motion.div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                <span className="text-xs font-mono text-[#e8c872]/80 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AUNAK · PROMO
                </span>
                {isSupported && (
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/50 border border-white/20 text-xs text-white"
                  >
                    {muted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    {muted ? copy.unmute : copy.mute}
                  </button>
                )}
              </div>
            </div>

            <div className="bg-[#12121a]/95 p-6 md:p-8" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <h2 className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-l from-[#e8c872] to-amber-400 mb-1">
                {copy.headline}
              </h2>
              <p className="text-sm text-slate-400 mb-4">{copy.sub}</p>
              <ul className="space-y-2 mb-6">
                {copy.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-sm text-slate-300">
                    <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    {b}
                  </li>
                ))}
              </ul>

              {studentId && (
                <div className="mb-4">
                  <p className="text-[10px] font-mono text-emerald-400/80 text-center mb-3 uppercase tracking-wider">
                    {copy.payOnline}
                  </p>
                  <PaymentCheckoutButton
                    lang={lang}
                    studentId={studentId}
                    plan={defaultPlan}
                    flow={flow}
                    customer={customer}
                  />
                  <p className="text-[10px] text-slate-600 text-center mt-3">{copy.payDivider}</p>
                </div>
              )}

              <button
                type="button"
                onClick={onContinue}
                className="w-full py-3.5 rounded-2xl border border-[#c9a962]/40 text-[#e8c872] font-bold hover:bg-[#c9a962]/10 transition-all mb-3"
              >
                {copy.cta}
              </button>
              <button
                type="button"
                onClick={onClose ?? onContinue}
                className="w-full py-2 text-sm text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" /> {copy.skip}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
