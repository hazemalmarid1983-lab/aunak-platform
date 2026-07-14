import { useState } from 'react';
import {
  getAssessmentQuestions,
  getScoringOptions,
  computeInitialAssessment,
  assessmentScorePayload,
} from '../../lib/initialAssessmentEngine';
import { saveInitialAssessmentScore } from '../../lib/airtable';

/**
 * Parent-facing free developmental baseline (12 questions / 4 relative-weight dimensions).
 * Saves initial_assessment_score + Dynamic Branching → Airtable, then routes to activation.
 */
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
  const allQuestions = getAssessmentQuestions(lang);
  const scoringOptions = getScoringOptions(lang);

  const [currentStep, setCurrentStep] = useState('questionnaire');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [showEncouragement, setShowEncouragement] = useState(false);

  const copy =
    copyOverrides ??
    (lang === 'en'
      ? {
          badge: 'Developmental Screening Matrix Gate',
          brand: 'Aunak Interactive Platform',
          tagline: 'Establishing a behavioral & cognitive baseline with scientific care and sovereign safety.',
          questionOf: 'Screening item',
          of: 'of',
          domain: 'Domain',
          previous: 'Previous item',
          charter: 'Aunak · Human safety charter',
          overallTitle: 'Psycho-neural harmony index & baseline measure',
          overallHint:
            'This percentage reflects the developmental and behavioral gap found in the Developmental Screening Matrix.',
          domainsTitle: 'Four relative-weight dimensions — detail:',
          gapHigh: 'Dominant weight — adaptive clinical branch priority.',
          gapMid: 'Moderate weight — secondary adaptive track.',
          gapLow: 'Lower relative weight in this pass.',
          encourage:
            'Four-dimension relative weights are sealed. Dynamic Branching will route the adaptive clinical stimuli.',
          encourageSub:
            'No parent diagnosis. Symptoms + age only feed clinical engines (CARS/GARS · ≤280ms · T-Static ≥5s).',
          ctaPremium: 'Activate consultative license & full screening',
          ctaFree: 'Continue to free gateway & Home Behavior Shaping Protocol',
          ctaContinue: 'Continue',
          saving: 'Saving report to Airtable…',
          saved: 'Documented and cloud-synced successfully',
          savedLocal: 'Saved locally (Aunak server ready)',
          waiting: 'Awaiting save confirmation',
          footer: 'Aunak digital platform for special education © 2026',
          footerSub: 'Social development honor charter · Salalah',
        }
      : {
          badge: 'مقياس المسح النمائي الأولي',
          brand: 'منصة عونك التفاعلية',
          tagline: 'تأسيس خط الأساس السلوكي والإدراكي للمستفيدين بحب علمي وبمنتهى الأمان والسيادة.',
          questionOf: 'بند المسح',
          of: 'من أصل',
          domain: 'المجال النمائي',
          previous: 'البند السابق',
          charter: 'منصة عونك · ميثاق الأمان الإنساني',
          overallTitle: 'مؤشر التناغم النفس-عصبي وقياس خط الأساس',
          overallHint:
            'هذه النسبة تشير إلى حجم الفجوة النمائية والسلوكية المكتشفة بناءً على مقياس المسح النمائي الأولي.',
          domainsTitle: 'تفاصيل الأوزان النسبية للأبعاد الأربعة:',
          gapHigh: 'وزن مهيمن — أولوية المسار التكيفي العيادي.',
          gapMid: 'وزن متوسط — مسار تكيفي ثانوي.',
          gapLow: 'وزن نسبي أدنى في هذه الجولة.',
          encourage:
            'أوزان الأبعاد الأربعة خُتمت. التفرع الديناميكي سيوجّه المثيرات العيادية التكيفية.',
          encourageSub:
            'لا تشخيص من الأهل. الأعراض والعمر فقط يغذّيان المحركات السريرية (CARS/GARS · ≤280ms · ثبات نظرة ≥5ث).',
          ctaPremium: 'تفعيل الرخصة الاستشارية والمسح الشامل',
          ctaFree: 'الاستمرار للبوابة المجانية وبروتوكول تشكيل السلوك المنزلي',
          ctaContinue: 'متابعة',
          saving: 'جاري حفظ التقرير في أيرتيبل...',
          saved: 'تم التوثيق والمزامنة السحابية بنجاح',
          savedLocal: 'تم الحفظ محلياً في الذاكرة (سيرفر عونك جاهز)',
          waiting: 'بانتظار تأكيد الحفظ',
          footer: 'منصة عونك الرقمية للتربية الخاصة والسيادة العصبية © 2026',
          footerSub: 'حائزة على ميثاق الشرف للتنمية الاجتماعية العُمانية ومصنفة من صلالة',
        });

  const persistScore = async (computed) => {
    setSaving(true);
    setSaveStatus('idle');
    const targetId =
      recordId ||
      (typeof sessionStorage !== 'undefined' &&
        (sessionStorage.getItem('student_record_id') || sessionStorage.getItem('student_id'))) ||
      (typeof localStorage !== 'undefined' &&
        (localStorage.getItem('student_record_id') || localStorage.getItem('student_id')));

    try {
      if (persistResult) {
        await persistResult(targetId, computed);
        setSaveStatus('success');
        return;
      }
      if (targetId) {
        await saveInitialAssessmentScore(targetId, {
          score: computed.scorePercent,
          payload: assessmentScorePayload(computed),
        });
        setSaveStatus('success');
        return;
      }
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('local_initial_assessment_score', String(computed.scorePercent));
        localStorage.setItem('local_assessment_answers', JSON.stringify(answers));
      }
      setSaveStatus('success');
    } catch (error) {
      console.error('[assessment] save failed:', error);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('local_initial_assessment_score', String(computed.scorePercent));
        localStorage.setItem('local_assessment_answers', JSON.stringify(answers));
      }
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleFinishQuestionnaire = async (nextAnswers) => {
    let computed;
    try {
      computed = computeInitialAssessment(nextAnswers, lang);
    } catch (error) {
      console.error('[assessment] compute failed:', error);
      setSaveStatus('error');
      return;
    }

    // Always leave the questionnaire first — never block on Airtable.
    setResult(computed);
    setCurrentStep('results');
    setTimeout(() => setShowEncouragement(true), 800);

    await persistScore(computed);

    // Sovereign funnel: after screening → license activation (phase 3).
    // Free path remains available via the secondary CTA on the results screen.
    if (!skipPromo) {
      setTimeout(() => {
        onComplete?.({ ...computed, path: 'premium', studentName, customer });
      }, 1400);
    }
  };

  const handleSelectAnswer = (score) => {
    const questionId = allQuestions[currentQuestionIndex].id;
    const nextAnswers = { ...answers, [questionId]: score };
    setAnswers(nextAnswers);

    if (currentQuestionIndex < allQuestions.length - 1) {
      setTimeout(() => setCurrentQuestionIndex((prev) => prev + 1), 150);
    } else {
      setTimeout(() => {
        void handleFinishQuestionnaire(nextAnswers);
      }, 200);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) setCurrentQuestionIndex((prev) => prev - 1);
  };

  const navigatePremium = () => {
    onComplete?.({ ...(result ?? {}), path: 'premium', studentName, customer });
  };

  const navigateFree = () => {
    onComplete?.({ ...(result ?? {}), path: 'free', studentName, customer });
  };

  const progressPercent = Math.round(((currentQuestionIndex + 1) / allQuestions.length) * 100);
  const domainDetails = result?.domainDetails ?? {};
  const overallPercentage = result?.scorePercent ?? 0;
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <div
      dir={dir}
      className="min-h-[70vh] bg-[#0B0F19] text-gray-100 font-sans flex flex-col items-center justify-center p-4 md:p-8 selection:bg-amber-500/20 selection:text-amber-400 rounded-2xl"
    >
      <div className="w-full max-w-3xl flex flex-col items-center mb-8 text-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">{copy.badge}</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#C5A880] to-yellow-100">
          {copy.brand}
        </h1>
        {studentName ? (
          <p className="text-[#C5A880] text-sm mt-2 font-semibold">{studentName}</p>
        ) : null}
        <p className="text-gray-400 text-xs md:text-sm mt-1 max-w-md">{copy.tagline}</p>
      </div>

      <div className="w-full max-w-3xl bg-[#111625]/90 border border-gray-800 rounded-2xl shadow-2xl p-6 md:p-10 relative overflow-hidden backdrop-blur-md">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {currentStep === 'questionnaire' ? (
          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-800 pb-5">
              <div>
                <span className="text-[10px] uppercase font-bold bg-[#C5A880]/15 text-[#C5A880] px-2 py-1 rounded">
                  {copy.domain}: {allQuestions[currentQuestionIndex].domainName}
                </span>
                <h3 className="text-gray-400 text-xs mt-2">
                  {copy.questionOf} {currentQuestionIndex + 1} {copy.of} {allQuestions.length}
                </h3>
              </div>

              <div className="flex items-center gap-3 w-full md:w-48">
                <div className="flex-1 bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-[#C5A880] h-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-gray-400">{progressPercent}%</span>
              </div>
            </div>

            <div className="my-8 min-h-[100px] flex items-center">
              <h2 className="text-lg md:text-xl font-bold leading-relaxed text-gray-100 border-r-4 border-[#C5A880] pr-4">
                {allQuestions[currentQuestionIndex].text}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
              {scoringOptions.map((opt) => {
                const isSelected = answers[allQuestions[currentQuestionIndex].id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelectAnswer(opt.value)}
                    className={`group text-right p-5 rounded-xl border transition-all duration-200 relative overflow-hidden ${
                      isSelected
                        ? 'bg-amber-500/10 border-[#C5A880] text-white shadow-[0_0_15px_rgba(197,168,128,0.1)]'
                        : 'bg-[#151B2B] border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span
                        className={`font-bold ${isSelected ? 'text-[#C5A880]' : 'text-gray-200 group-hover:text-white'}`}
                      >
                        {opt.label}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                          isSelected ? 'border-[#C5A880] bg-[#C5A880]' : 'border-gray-700'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#111625]" />}
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-normal line-clamp-1">{opt.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-800/60">
              <button
                type="button"
                onClick={() => (currentQuestionIndex === 0 ? onBack?.() : handlePreviousQuestion())}
                disabled={currentQuestionIndex === 0 && !onBack}
                className={`flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-lg transition-all ${
                  currentQuestionIndex === 0 && !onBack
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-400 hover:text-[#C5A880]'
                }`}
              >
                <span>{lang === 'ar' ? '→' : '←'}</span>
                <span>{currentQuestionIndex === 0 && onBack ? (lang === 'en' ? 'Back' : 'رجوع') : copy.previous}</span>
              </button>

              <span className="text-xs text-gray-500">{copy.charter}</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-dashed border-[#C5A880] flex items-center justify-center relative mb-4">
                <div className="absolute inset-2 bg-gradient-to-tr from-amber-500/10 to-[#C5A880]/15 rounded-full flex flex-col items-center justify-center">
                  <span className="text-3xl font-extrabold text-[#C5A880] font-mono">{overallPercentage}%</span>
                </div>
              </div>
              <h2 className="text-lg font-bold text-gray-100">{copy.overallTitle}</h2>
              <p className="text-xs text-gray-400 mt-1 max-w-sm text-center">{copy.overallHint}</p>
              {result?.title ? (
                <p className="text-sm text-amber-200/90 mt-3 font-semibold text-center">{result.title}</p>
              ) : null}
            </div>

            <div className="w-full space-y-4 mb-8">
              <h3 className="text-sm font-semibold text-[#C5A880] border-r-2 border-[#C5A880] pr-2 mb-4">
                {copy.domainsTitle}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(domainDetails).map(([id, dom]) => {
                  let barColor = 'bg-emerald-500';
                  let textColor = 'text-emerald-400';
                  if (dom.percentage >= 65) {
                    barColor = 'bg-red-500';
                    textColor = 'text-red-400';
                  } else if (dom.percentage >= 35) {
                    barColor = 'bg-amber-500';
                    textColor = 'text-amber-400';
                  }
                  const weightPct =
                    dom.weight != null ? Math.round(Number(dom.weight) * 100) : null;

                  return (
                    <div
                      key={id}
                      className="bg-[#151B2B] border border-gray-800/80 rounded-xl p-4 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-semibold text-gray-200">{dom.name}</span>
                        <span className={`text-xs font-bold font-mono ${textColor}`}>
                          {dom.percentage}%
                          {weightPct != null ? ` · w${weightPct}%` : ''}
                        </span>
                      </div>

                      <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-1000 ease-out`}
                          style={{ width: `${dom.percentage}%` }}
                        />
                      </div>

                      <p className="text-[10px] text-gray-500 mt-1.5">
                        {dom.percentage >= 65
                          ? copy.gapHigh
                          : dom.percentage >= 35
                            ? copy.gapMid
                            : copy.gapLow}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              className={`w-full bg-[#182033] border border-gray-800 rounded-xl p-5 mb-8 text-center transition-all duration-700 transform ${
                showEncouragement ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <p className="text-gray-200 text-xs md:text-sm font-semibold leading-relaxed">
                &ldquo;{copy.encourage}&rdquo;
              </p>
              <div className="h-px bg-gradient-to-r from-transparent via-[#C5A880]/30 to-transparent my-3" />
              <p className="text-amber-200 text-xs font-bold leading-normal">{copy.encourageSub}</p>
            </div>

            {skipPromo ? (
              <button
                type="button"
                onClick={() => onComplete?.(result)}
                className="w-full bg-gradient-to-r from-amber-500 to-[#C5A880] hover:from-amber-600 hover:to-[#B3966D] text-black font-extrabold text-sm py-4 px-6 rounded-xl transition-all"
              >
                {copy.ctaContinue}
              </button>
            ) : (
              <div className="w-full flex flex-col md:flex-row gap-4">
                <button
                  type="button"
                  onClick={navigatePremium}
                  className="flex-1 bg-gradient-to-r from-amber-500 to-[#C5A880] hover:from-amber-600 hover:to-[#B3966D] text-black font-extrabold text-sm py-4 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{copy.ctaPremium}</span>
                </button>

                <button
                  type="button"
                  onClick={navigateFree}
                  className="flex-1 bg-transparent hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700 hover:border-gray-500 font-semibold text-sm py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>{copy.ctaFree}</span>
                </button>
              </div>
            )}

            <div className="w-full flex items-center justify-center mt-6 gap-2 text-[10px] text-gray-500">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  saveStatus === 'success'
                    ? 'bg-emerald-500'
                    : saveStatus === 'error'
                      ? 'bg-red-500'
                      : 'bg-amber-500 animate-pulse'
                }`}
              />
              <span>
                {saving
                  ? copy.saving
                  : saveStatus === 'success'
                    ? copy.saved
                    : saveStatus === 'error'
                      ? copy.savedLocal
                      : copy.waiting}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-[10px] text-gray-600 flex flex-col items-center gap-1">
        <span>{copy.footer}</span>
        <span>{copy.footerSub}</span>
      </div>
    </div>
  );
}
