import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Crosshair, Eye, Zap } from 'lucide-react';
import {
  buildStimulusQueue,
  scoreTrial,
  adaptLevel,
  buildAdaptiveZeroPointReport,
  adaptiveSessionAirtableFields,
  stimulusCopy,
  RESPONSE_LATENCY_MS,
  T_STATIC_MS,
  CLINICAL_FIELD_TARGET,
} from '../../lib/adaptiveClinicalEngine';
import { updateStudentRecord } from '../../lib/airtable';
import { STUDENT as SF } from '../../lib/airtableFields';
import { LUX } from '../../lib/luxTheme';

/**
 * Adaptive clinical stimuli — measures response latency (≤280ms) and gaze hold (T-Static ≥5s).
 * Level ± 1 fills 66 CARS/GARS-linked fields on Students (tblzYmBGmCxx2vdcr).
 */
export default function AdaptiveClinicalAssessment({
  lang = 'ar',
  recordId,
  studentName = '',
  primaryDimension = 'behavioral',
  onComplete,
  onBack,
}) {
  const [level, setLevel] = useState(3);
  const [trialIndex, setTrialIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [phase, setPhase] = useState('ready'); // ready | trial | gaze | saving | done
  const [gazeHeldMs, setGazeHeldMs] = useState(0);
  const [error, setError] = useState('');
  const shownAtRef = useRef(0);
  const gazeTimerRef = useRef(null);

  const queue = useMemo(
    () => buildStimulusQueue(primaryDimension, level),
    // Rebuild only when dimension changes — level adapts mid-session without reshuffling
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [primaryDimension]
  );

  const trials = queue.trials;
  const trial = trials[trialIndex] ?? null;

  const copy =
    lang === 'en'
      ? {
          badge: 'Adaptive Clinical Stimuli',
          title: 'Comprehensive clinical assessment',
          tagline: `Latency ≤${RESPONSE_LATENCY_MS}ms · T-Static ≥${T_STATIC_MS / 1000}s · Level ±1 → ${CLINICAL_FIELD_TARGET} fields`,
          start: 'Begin adaptive protocol',
          respond: 'Respond now',
          holdGaze: 'Hold gaze on the target…',
          miss: 'Miss / no response',
          saving: 'Sealing 66 clinical fields to Students…',
          done: 'Adaptive assessment sealed',
          continue: 'Continue to biometric gate',
          level: 'Level',
          trial: 'Stimulus',
          of: 'of',
          branch: 'Branch',
        }
      : {
          badge: 'مثيرات عيادية تكيفية',
          title: 'التقييم الشامل العيادي',
          tagline: `كمون ≤${RESPONSE_LATENCY_MS}ms · ثبات نظرة ≥${T_STATIC_MS / 1000}ث · Level ±1 → ${CLINICAL_FIELD_TARGET} حقلاً`,
          start: 'بدء البروتوكول التكيفي',
          respond: 'استجب الآن',
          holdGaze: 'ثبّت النظرة على الهدف…',
          miss: 'تفويت / بلا استجابة',
          saving: 'ختم 66 حقلاً عيادةً في جدول الطلاب…',
          done: 'اكتمل التقييم التكيفي وخُتم',
          continue: 'المتابعة إلى بوابة البصمة',
          level: 'المستوى',
          trial: 'مثير',
          of: 'من',
          branch: 'المسار',
        };

  useEffect(() => {
    if (phase !== 'trial' && phase !== 'gaze') return undefined;
    shownAtRef.current = performance.now();
    setGazeHeldMs(0);

    if (trial?.gazeHold) {
      setPhase('gaze');
      const started = performance.now();
      gazeTimerRef.current = window.setInterval(() => {
        const held = performance.now() - started;
        setGazeHeldMs(held);
        if (held >= T_STATIC_MS) {
          window.clearInterval(gazeTimerRef.current);
          commitTrial({ correct: true, latencyMs: held, gazeHeldMs: held, gazeHold: true });
        }
      }, 100);
      return () => {
        if (gazeTimerRef.current) window.clearInterval(gazeTimerRef.current);
      };
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, trialIndex]);

  const sealAndFinish = useCallback(
    async (allResults, finalLevel) => {
      setPhase('saving');
      const report = buildAdaptiveZeroPointReport({
        trialsResults: allResults,
        primaryDimension,
        levelFinal: finalLevel,
      });
      const fields = adaptiveSessionAirtableFields(report, {
        [SF.preferred_destination]: 'live',
        [SF.focus_level]: Math.round(
          100 - (allResults.reduce((a, r) => a + (r.clinicalScore ?? 2), 0) / Math.max(1, allResults.length)) * 25
        ),
        [SF.t_static]: allResults.some((r) => r.tStaticOk) ? T_STATIC_MS / 1000 : 0,
      });

      try {
        if (recordId) {
          await updateStudentRecord(recordId, fields);
        }
        setPhase('done');
        onComplete?.({
          report,
          primaryDimension,
          levelFinal: finalLevel,
          fieldCount: CLINICAL_FIELD_TARGET,
          landingSection: 'live',
        });
      } catch (e) {
        setError(e?.message || 'SAVE_FAILED');
        setPhase('done');
        onComplete?.({
          report,
          primaryDimension,
          levelFinal: finalLevel,
          fieldCount: CLINICAL_FIELD_TARGET,
          landingSection: 'live',
          saveError: e?.message,
        });
      }
    },
    [primaryDimension, recordId, onComplete]
  );

  const commitTrial = useCallback(
    ({ correct, latencyMs, gazeHeldMs: held = 0, gazeHold = false }) => {
      if (gazeTimerRef.current) window.clearInterval(gazeTimerRef.current);
      const scored = scoreTrial({ latencyMs, correct, gazeHeldMs: held, gazeHold });
      const nextLevel = adaptLevel(level, scored.delta);
      setLevel(nextLevel);
      const row = {
        trialId: trial?.id,
        level,
        ...scored,
        latencyMs,
        gazeHeldMs: held,
      };
      const nextResults = [...results, row];
      setResults(nextResults);

      if (trialIndex >= trials.length - 1) {
        void sealAndFinish(nextResults, nextLevel);
        return;
      }
      setTrialIndex((i) => i + 1);
      setPhase('trial');
    },
    [level, results, trial, trialIndex, trials.length, sealAndFinish]
  );

  const handleRespond = () => {
    const latency = performance.now() - shownAtRef.current;
    commitTrial({ correct: true, latencyMs: latency, gazeHold: false });
  };

  const handleMiss = () => {
    const latency = performance.now() - shownAtRef.current;
    commitTrial({ correct: false, latencyMs: latency, gazeHold: Boolean(trial?.gazeHold) });
  };

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const progress = trials.length ? Math.round(((trialIndex + (phase === 'done' ? 1 : 0)) / trials.length) * 100) : 0;

  return (
    <div dir={dir} className="min-h-[70vh] bg-[#0a0a0c] text-slate-200 p-4 md:p-8 flex flex-col items-center">
      <div className="w-full max-w-2xl text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crosshair className="w-4 h-4 text-emerald-400" />
          <span className="text-xs uppercase tracking-wider text-[#C5A880] font-semibold">{copy.badge}</span>
        </div>
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-[#C5A880] to-emerald-200">
          {copy.title}
        </h1>
        {studentName ? <p className="text-sm text-[#C5A880] mt-2 font-semibold">{studentName}</p> : null}
        <p className="text-xs text-slate-400 mt-1">{copy.tagline}</p>
        <p className="text-[11px] text-slate-500 mt-2 font-mono">
          {copy.branch}: {primaryDimension} · {copy.level} {level}
        </p>
      </div>

      <div className="w-full max-w-2xl bg-[#12121a]/90 border border-[#c9a962]/20 rounded-3xl p-6 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_30%_0%,rgba(52,211,153,0.06),transparent_50%)]" />

        {phase === 'ready' && (
          <div className="relative text-center space-y-6">
            <Zap className="w-12 h-12 text-emerald-400 mx-auto" />
            <p className="text-sm text-slate-300 leading-relaxed">{copy.tagline}</p>
            <button
              type="button"
              onClick={() => setPhase('trial')}
              className={`${LUX.btnEmerald} w-full py-3 rounded-xl font-bold`}
            >
              {copy.start}
            </button>
            {onBack ? (
              <button type="button" onClick={onBack} className="text-xs text-slate-500 hover:text-slate-300">
                {lang === 'en' ? 'Back' : 'رجوع'}
              </button>
            ) : null}
          </div>
        )}

        {(phase === 'trial' || phase === 'gaze') && trial && (
          <div className="relative">
            <div className="flex justify-between text-[11px] text-slate-500 mb-4 font-mono">
              <span>
                {copy.trial} {trialIndex + 1} {copy.of} {trials.length}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="min-h-[120px] flex items-center justify-center border border-white/[0.06] rounded-2xl bg-black/40 mb-6 p-6">
              {phase === 'gaze' ? (
                <div className="flex flex-col items-center gap-3">
                  <Eye className="w-10 h-10 text-cyan-300 animate-pulse" />
                  <div className="w-16 h-16 rounded-full border-2 border-cyan-400/60 shadow-[0_0_24px_rgba(34,211,238,0.35)]" />
                  <p className="text-sm text-cyan-100">{copy.holdGaze}</p>
                  <p className="text-xs font-mono text-slate-400">{Math.min(T_STATIC_MS, Math.round(gazeHeldMs))}ms</p>
                </div>
              ) : (
                <h2 className="text-lg md:text-xl font-bold text-center leading-relaxed text-slate-100">
                  {stimulusCopy(trial, lang)}
                </h2>
              )}
            </div>
            {phase === 'trial' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleRespond}
                  className={`${LUX.btnEmerald} py-3 rounded-xl font-bold`}
                >
                  {copy.respond}
                </button>
                <button
                  type="button"
                  onClick={handleMiss}
                  className="py-3 rounded-xl border border-rose-400/30 text-rose-200 text-sm font-semibold hover:bg-rose-500/10"
                >
                  {copy.miss}
                </button>
              </div>
            )}
          </div>
        )}

        {phase === 'saving' && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin" />
            <p className="text-sm text-slate-300">{copy.saving}</p>
          </div>
        )}

        {phase === 'done' && (
          <div className="text-center space-y-4 py-6">
            <p className="text-emerald-300 font-semibold">{copy.done}</p>
            {error ? <p className="text-xs text-amber-300">{error}</p> : null}
            <button
              type="button"
              onClick={() =>
                onComplete?.({
                  primaryDimension,
                  levelFinal: level,
                  fieldCount: CLINICAL_FIELD_TARGET,
                  landingSection: 'live',
                  alreadySealed: true,
                })
              }
              className={`${LUX.btnEmerald} w-full py-3 rounded-xl font-bold`}
            >
              {copy.continue}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
