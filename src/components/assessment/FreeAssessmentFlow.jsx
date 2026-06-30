import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Loader2, ClipboardList } from 'lucide-react';
import {
  getAssessmentQuestions,
  computeInitialAssessment,
  assessmentScorePayload,
} from '../../lib/initialAssessmentEngine';
import { saveInitialAssessmentScore } from '../../lib/airtable';
import AssessmentResultScreen from './AssessmentResultScreen';
import AssessmentPromoModal from './AssessmentPromoModal';
import { LUX } from '../../lib/luxTheme';

export default function FreeAssessmentFlow({
  lang = 'ar',
  studentName = '',
  recordId,
  customer,
  onComplete,
  onBack,
  persistResult,
  skipPromo = false,
  copyOverrides = null,
}) {
  const questions = getAssessmentQuestions(lang);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [phase, setPhase] = useState('quiz');
  const [result, setResult] = useState(null);
  const [promoOpen, setPromoOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const copy =
    copyOverrides ??
    (lang === 'en'
      ? {
          title: 'Quick skills scan',
          subtitle: '6 clear questions — real preliminary insight in ~3 minutes',
          progress: 'Question',
          of: 'of',
          back: 'Back',
          next: 'Next',
          seeResult: 'See my result',
          saving: 'Saving result...',
        }
      : {
          title: 'مسح سريع للمهارات',
          subtitle: '6 أسئلة واضحة — نتيجة مبدئية حقيقية في ~3 دقائق',
          progress: 'سؤال',
          of: 'من',
          back: 'رجوع',
          next: 'التالي',
          seeResult: 'عرض نتيجتي',
          saving: 'جاري حفظ النتيجة...',
        });

  const q = questions[step];
  const selected = answers[q?.id];
  const allAnswered = questions.every((item) => answers[item.id] != null);

  useEffect(() => {
    if (phase !== 'result' || !result || skipPromo) return undefined;
    const t = setTimeout(() => setPromoOpen(true), 1800);
    return () => clearTimeout(t);
  }, [phase, result, skipPromo]);

  const pick = (score) => {
    setAnswers((prev) => ({ ...prev, [q.id]: score }));
  };

  const finish = async () => {
    const computed = computeInitialAssessment(answers, lang);
    setResult(computed);
    setPhase('result');
    setBusy(true);
    setError('');
    try {
      if (persistResult) {
        await persistResult(recordId, computed);
      } else if (recordId) {
        await saveInitialAssessmentScore(recordId, {
          score: computed.scorePercent,
          payload: assessmentScorePayload(computed),
        });
      }
    } catch (e) {
      console.warn('[assessment] save:', e?.message);
      setError(lang === 'en' ? 'Result shown — save to cloud pending' : 'النتيجة ظاهرة — الحفظ السحابي قيد الانتظار');
    } finally {
      setBusy(false);
    }
  };

  const handlePromoContinue = () => {
    setPromoOpen(false);
    onComplete?.(result);
  };

  if (phase === 'result' && result) {
    return (
      <>
        <AssessmentResultScreen
          lang={lang}
          result={result}
          studentName={studentName}
          onShowPromo={() => (skipPromo ? handlePromoContinue() : setPromoOpen(true))}
        />
        {error && <p className="text-center text-amber-400/90 text-xs mt-3">{error}</p>}
        <AssessmentPromoModal
          lang={lang}
          open={promoOpen && !skipPromo}
          studentId={recordId}
          customer={customer}
          flow="enrollment"
          onContinue={handlePromoContinue}
          onClose={handlePromoContinue}
        />
        {skipPromo && (
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={handlePromoContinue}
              className="px-8 py-3 rounded-2xl font-black bg-gradient-to-l from-emerald-500 to-teal-500 text-[#0a0a0c]"
            >
              {lang === 'en' ? 'Continue to island' : 'العودة إلى الجزيرة'}
            </button>
          </div>
        )}
        {!promoOpen && !skipPromo && (
          <p className="text-center text-xs text-slate-500 mt-4 animate-pulse">
            {lang === 'en' ? 'Tap the button above to continue' : 'اضغط الزر أعلاه للمتابعة'}
          </p>
        )}
      </>
    );
  }

  return (
    <div className="max-w-lg mx-auto" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className={`${LUX.glassCard} mb-6`}>
        <div className="flex items-center gap-3 mb-4">
          <ClipboardList className="w-10 h-10 text-emerald-400" />
          <div>
            <h2 className={LUX.headingGold}>{copy.title}</h2>
            <p className="text-xs text-slate-500">{copy.subtitle}</p>
          </div>
        </div>
        <div className="h-2 rounded-full bg-white/5 overflow-hidden mb-2">
          <motion.div
            className="h-full bg-gradient-to-l from-emerald-400 to-teal-400"
            animate={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
        <p className="text-xs font-mono text-slate-500">
          {copy.progress} {step + 1} {copy.of} {questions.length}
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: lang === 'ar' ? -20 : 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: lang === 'ar' ? 20 : -20 }}
          className={`${LUX.glassCard}`}
        >
          <p className="text-lg font-bold text-slate-200 mb-6 leading-relaxed">{q.text}</p>
          <div className="space-y-3">
            {q.options.map((opt) => (
              <button
                key={opt.label}
                type="button"
                onClick={() => pick(opt.score)}
                className={`w-full text-start py-4 px-5 rounded-2xl border-2 transition-all ${
                  selected === opt.score
                    ? 'border-emerald-400 bg-emerald-500/15 text-emerald-100 shadow-[0_0_24px_rgba(52,211,153,0.2)]'
                    : 'border-white/[0.08] bg-[#0d0d10]/50 text-slate-300 hover:border-emerald-400/35'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={() => (step === 0 ? onBack?.() : setStep((s) => s - 1))}
          className={LUX.btnGhost}
        >
          {lang === 'ar' ? <ChevronRight className="w-4 h-4 inline" /> : <ChevronLeft className="w-4 h-4 inline" />}{' '}
          {copy.back}
        </button>
        {step < questions.length - 1 ? (
          <button
            type="button"
            disabled={selected == null}
            onClick={() => setStep((s) => s + 1)}
            className={`${LUX.btnEmerald} flex-1 flex items-center justify-center gap-2 disabled:opacity-40`}
          >
            {copy.next}
            {lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <button
            type="button"
            disabled={!allAnswered || busy}
            onClick={finish}
            className={`${LUX.btnGold} flex-1 flex items-center justify-center gap-2 disabled:opacity-40`}
          >
            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {busy ? copy.saving : copy.seeResult}
          </button>
        )}
      </div>
    </div>
  );
}
