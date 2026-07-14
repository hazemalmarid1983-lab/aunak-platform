import { describe, it, expect } from 'vitest';
import {
  SCREENING_DIMENSIONS,
  getAssessmentQuestions,
  computeInitialAssessment,
  computeDimensionWeights,
  resolveDynamicBranch,
} from '../src/lib/initialAssessmentEngine.js';
import {
  scoreTrial,
  adaptLevel,
  mapTrialsToZeroPointFields,
  RESPONSE_LATENCY_MS,
  T_STATIC_MS,
} from '../src/lib/adaptiveClinicalEngine.js';
import { ZERO_POINT_FIELD_COUNT } from '../src/lib/zeroPointSchema.js';

describe('sovereign screening V1', () => {
  it('exposes exactly 4 dimensions and 12 questions', () => {
    expect(SCREENING_DIMENSIONS).toEqual(['linguistic', 'behavioral', 'cognitive', 'motor']);
    expect(getAssessmentQuestions('ar')).toHaveLength(12);
  });

  it('computes relative weights and Dynamic Branching', () => {
    const answers = {
      q1: 3, q2: 3, q3: 3, // linguistic max
      q4: 0, q5: 0, q6: 0,
      q7: 1, q8: 1, q9: 1,
      q10: 0, q11: 0, q12: 0,
    };
    const weights = computeDimensionWeights(answers);
    expect(weights.primaryDimension).toBe('linguistic');
    expect(weights.weights.linguistic).toBeGreaterThan(weights.weights.behavioral);

    const branch = resolveDynamicBranch(weights);
    expect(branch.clinicalPath).toBe('vb_mapp_language');

    const result = computeInitialAssessment(answers, 'ar');
    expect(result.primaryDimension).toBe('linguistic');
    expect(result.dimensionWeights.linguistic).toBeGreaterThan(0);
  });
});

describe('adaptive clinical stimuli', () => {
  it('scores latency under 280ms and T-Static ≥5s', () => {
    const fast = scoreTrial({ latencyMs: RESPONSE_LATENCY_MS - 10, correct: true });
    expect(fast.underLatency).toBe(true);
    expect(fast.delta).toBe(1);

    const gaze = scoreTrial({
      latencyMs: T_STATIC_MS,
      correct: true,
      gazeHold: true,
      gazeHeldMs: T_STATIC_MS,
    });
    expect(gaze.tStaticOk).toBe(true);
    expect(adaptLevel(3, gaze.delta)).toBe(4);
  });

  it('maps trials into 66 zero-point fields', () => {
    const mapped = mapTrialsToZeroPointFields(
      [{ clinicalScore: 2, underLatency: true, tStaticOk: true }],
      'behavioral'
    );
    expect(mapped.fieldCount).toBe(ZERO_POINT_FIELD_COUNT);
    expect(Object.keys(mapped.fields).length).toBe(ZERO_POINT_FIELD_COUNT);
  });
});
