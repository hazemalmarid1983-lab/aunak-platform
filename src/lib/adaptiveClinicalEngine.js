/**
 * Adaptive Clinical Stimuli Engine — V1 sovereign protocol.
 * Latency ≤ 280ms · T-Static ≥ 5s · Level ± 1 → fill 66 CARS/GARS/VB-MAPP fields.
 */

import { MELTDOWN_LATENCY_MS, GAZE_HOLD_MS, SESSION_FIELD_COUNT } from './sovereignProtocol';
import {
  ZERO_POINT_FIELDS,
  ZERO_POINT_FIELD_COUNT,
  ensureFullFieldMap,
  buildZeroPointReport,
  zeroPointAirtableFields,
} from './zeroPointSchema';
import { SCREENING_DIMENSIONS } from './initialAssessmentEngine';

export const RESPONSE_LATENCY_MS = MELTDOWN_LATENCY_MS;
export const T_STATIC_MS = GAZE_HOLD_MS;
export const LEVEL_MIN = 1;
export const LEVEL_MAX = 5;
export const CLINICAL_FIELD_TARGET = SESSION_FIELD_COUNT;

/** Map screening branch → primary clinical scale + stimulus track. */
export const BRANCH_TO_SCALE = {
  linguistic: { scale: 'VB-MAPP', track: 'language', carsRange: [1, 5], garsRange: [1, 4] },
  behavioral: { scale: 'GARS-3', track: 'behavior', carsRange: [6, 10], garsRange: [5, 10] },
  cognitive: { scale: 'CARS-2', track: 'cognition', carsRange: [11, 15], garsRange: [11, 14] },
  motor: { scale: 'CARS-2', track: 'motor', carsRange: [1, 8], garsRange: [1, 7] },
};

const STIMULUS_BANK = {
  linguistic: [
    { id: 'ling_1', cueAr: 'أشر إلى الصورة التي تطابق الكلمة المنطوقة', cueEn: 'Point to the picture matching the spoken word', targetMs: 280 },
    { id: 'ling_2', cueAr: 'كرّر المقطع الصوتي عند ظهور المثير', cueEn: 'Repeat the syllable when the stimulus appears', targetMs: 280 },
    { id: 'ling_3', cueAr: 'اختر الطلب الوظيفي المناسب (mand)', cueEn: 'Select the functional request (mand)', targetMs: 320 },
  ],
  behavioral: [
    { id: 'beh_1', cueAr: 'ثبّت النظرة على الهدف حتى يختفي', cueEn: 'Hold gaze on the target until it fades', targetMs: 5000, gazeHold: true },
    { id: 'beh_2', cueAr: 'انتظر الإشارة قبل الاستجابة (inhibit)', cueEn: 'Wait for the cue before responding (inhibit)', targetMs: 400 },
    { id: 'beh_3', cueAr: 'اختر البديل الهادئ عند المثير المزعج', cueEn: 'Choose the calm alternative under aversive cue', targetMs: 350 },
  ],
  cognitive: [
    { id: 'cog_1', cueAr: 'طابق الشكل مع الفئة المنطقية', cueEn: 'Match the shape to its logical category', targetMs: 300 },
    { id: 'cog_2', cueAr: 'أكمل التسلسل البصري من 3 خطوات', cueEn: 'Complete the 3-step visual sequence', targetMs: 350 },
    { id: 'cog_3', cueAr: 'اختر القاعدة الصحيحة للمثير', cueEn: 'Select the correct rule for the stimulus', targetMs: 320 },
  ],
  motor: [
    { id: 'mot_1', cueAr: 'المس الهدف خلال العتبة الزمنية', cueEn: 'Tap the target within the latency threshold', targetMs: 280 },
    { id: 'mot_2', cueAr: 'تتبّع المسار الحركي دون خروج', cueEn: 'Trace the motor path without leaving the lane', targetMs: 400 },
    { id: 'mot_3', cueAr: 'نفّذ ضغطة مزدوجة متزامنة', cueEn: 'Perform a synchronized double-tap', targetMs: 280 },
  ],
};

export function resolveBranchConfig(primaryDimension) {
  const key = SCREENING_DIMENSIONS.includes(primaryDimension)
    ? primaryDimension
    : 'behavioral';
  return { dimension: key, ...(BRANCH_TO_SCALE[key] ?? BRANCH_TO_SCALE.behavioral) };
}

/** Build adaptive trial queue from branch + current level (1–5). */
export function buildStimulusQueue(primaryDimension, level = 3) {
  const cfg = resolveBranchConfig(primaryDimension);
  const bank = STIMULUS_BANK[cfg.dimension] ?? STIMULUS_BANK.behavioral;
  const lvl = clampLevel(level);
  const repeats = Math.min(LEVEL_MAX, Math.max(2, lvl));
  const trials = [];
  for (let r = 0; r < repeats; r += 1) {
    for (const s of bank) {
      trials.push({
        ...s,
        level: lvl,
        dimension: cfg.dimension,
        scale: cfg.scale,
        track: cfg.track,
        targetMs: s.gazeHold ? T_STATIC_MS : Math.max(RESPONSE_LATENCY_MS, s.targetMs - (lvl - 3) * 20),
      });
    }
  }
  return { config: cfg, trials, level: lvl };
}

export function clampLevel(n) {
  const v = Number(n);
  if (!Number.isFinite(v)) return 3;
  return Math.max(LEVEL_MIN, Math.min(LEVEL_MAX, Math.round(v)));
}

/**
 * Score one trial → adaptation delta (−1 | 0 | +1).
 * Fast accurate (< 280ms, non-gaze) raises level; slow / gaze-timeout / miss lowers.
 */
export function scoreTrial({ latencyMs, correct, gazeHeldMs = 0, gazeHold = false }) {
  const latency = Number(latencyMs);
  let delta = 0;
  let clinicalScore = 2; // 0–4 CARS-style

  if (gazeHold) {
    const held = Number(gazeHeldMs) || 0;
    if (held >= T_STATIC_MS && correct) {
      clinicalScore = 1;
      delta = 1;
    } else if (held >= T_STATIC_MS * 0.6) {
      clinicalScore = 2;
      delta = 0;
    } else {
      clinicalScore = 3;
      delta = -1;
    }
  } else if (correct && Number.isFinite(latency) && latency <= RESPONSE_LATENCY_MS) {
    clinicalScore = 1;
    delta = 1;
  } else if (correct && Number.isFinite(latency) && latency <= RESPONSE_LATENCY_MS * 1.5) {
    clinicalScore = 2;
    delta = 0;
  } else if (correct) {
    clinicalScore = 3;
    delta = -1;
  } else {
    clinicalScore = 4;
    delta = -1;
  }

  return {
    delta,
    clinicalScore,
    underLatency: Number.isFinite(latency) && latency <= RESPONSE_LATENCY_MS,
    tStaticOk: gazeHold ? (Number(gazeHeldMs) || 0) >= T_STATIC_MS : null,
  };
}

/** Apply Level ± 1 after each trial. */
export function adaptLevel(currentLevel, delta) {
  return clampLevel(currentLevel + (delta > 0 ? 1 : delta < 0 ? -1 : 0));
}

/**
 * Map trial results → partial 66-field zero-point map (CARS/GARS primary + VB-MAPP fillers).
 */
export function mapTrialsToZeroPointFields(trialsResults = [], primaryDimension = 'behavioral') {
  const cfg = resolveBranchConfig(primaryDimension);
  const fields = ensureFullFieldMap({});
  const scores = trialsResults.map((t) => t.clinicalScore).filter((n) => n != null);
  const avg =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 2;

  const fillRange = (prefix, start, end, base) => {
    for (let i = start; i <= end; i += 1) {
      const id = `${prefix}_${String(i).padStart(2, '0')}`;
      if (fields[id] !== undefined) {
        const jitter = ((i % 3) - 1) * 0.3;
        fields[id] = Math.max(0, Math.min(4, Math.round(base + jitter)));
      }
    }
  };

  fillRange('cars', cfg.carsRange[0], cfg.carsRange[1], avg);
  fillRange('gars', cfg.garsRange[0], cfg.garsRange[1], avg);

  // Fill remaining score fields toward 66 with branch-weighted baseline
  for (const def of ZERO_POINT_FIELDS) {
    if (def.type !== 'score_0_4') continue;
    if (fields[def.id] == null) {
      fields[def.id] = Math.max(0, Math.min(4, Math.round(avg)));
    }
  }

  const underLatencyCount = trialsResults.filter((t) => t.underLatency).length;
  const tStaticHits = trialsResults.filter((t) => t.tStaticOk === true).length;

  fields.meta_assessor = 'adaptive_stimuli_engine';
  fields.meta_assessment_date = new Date().toISOString().slice(0, 10);
  fields.meta_primary_scale = cfg.scale;
  fields.meta_raw_notes = JSON.stringify({
    branch: cfg.dimension,
    under_latency_count: underLatencyCount,
    t_static_hits: tStaticHits,
    latency_threshold_ms: RESPONSE_LATENCY_MS,
    t_static_ms: T_STATIC_MS,
    trials: trialsResults.length,
  });
  fields.meta_final_score = Math.round(((4 - avg) / 4) * 100);
  fields.meta_communication_index =
    cfg.dimension === 'linguistic' ? fields.meta_final_score : Math.max(0, fields.meta_final_score - 8);
  fields.meta_social_index =
    cfg.dimension === 'behavioral' ? fields.meta_final_score : Math.max(0, fields.meta_final_score - 5);
  fields.meta_behavior_index = Math.round(100 - (fields.meta_final_score ?? 50));
  fields.meta_severity_band =
    avg <= 1.5 ? 'mild' : avg <= 2.5 ? 'moderate' : 'support_intensive';
  fields.meta_recommendation = `Adaptive branch=${cfg.dimension}; scale=${cfg.scale}; Level±1 complete.`;

  return {
    fields: ensureFullFieldMap(fields),
    fieldCount: ZERO_POINT_FIELD_COUNT,
    config: cfg,
    avgClinical: avg,
    underLatencyCount,
    tStaticHits,
  };
}

/** Build Airtable-ready zero-point report from adaptive session. */
export function buildAdaptiveZeroPointReport({
  trialsResults,
  primaryDimension,
  levelFinal,
  assessor = 'adaptive_stimuli_engine',
} = {}) {
  const mapped = mapTrialsToZeroPointFields(trialsResults, primaryDimension);
  return buildZeroPointReport({
    activeScale: mapped.config.scale,
    assessor,
    rawNotes: mapped.fields.meta_raw_notes,
    finalScore: mapped.fields.meta_final_score,
    fieldValues: {
      ...mapped.fields,
      meta_raw_notes: `${mapped.fields.meta_raw_notes}|level_final=${levelFinal}`,
    },
  });
}

export function adaptiveSessionAirtableFields(report, extras = {}) {
  return {
    ...zeroPointAirtableFields(report),
    ...extras,
  };
}

export function stimulusCopy(trial, lang = 'ar') {
  if (!trial) return '';
  return lang === 'en' ? trial.cueEn : trial.cueAr;
}

export { CLINICAL_FIELD_TARGET as TARGET_FIELD_COUNT };
