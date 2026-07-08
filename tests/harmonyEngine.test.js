import { describe, it, expect } from 'vitest';
import {
  computeHarmonyScore,
  normalize0to100,
  HARMONY_GAP_THRESHOLD,
} from '../src/lib/harmonyEngine.js';

describe('harmonyEngine', () => {
  it('normalize0to100 clamps and parses percentages', () => {
    expect(normalize0to100('85%')).toBe(85);
    expect(normalize0to100(0.85)).toBe(85);
    expect(normalize0to100('bad')).toBe(null);
  });

  it('computeHarmonyScore applies 20% penalty when academic-behavior gap >= threshold', () => {
    const noPenalty = computeHarmonyScore({
      academicProgress: 90,
      behaviorIntensity: 85,
      baseScore: 80,
    });
    const penalized = computeHarmonyScore({
      academicProgress: 90,
      behaviorIntensity: 60,
      baseScore: 80,
    });
    expect(HARMONY_GAP_THRESHOLD).toBe(20);
    expect(penalized).toBeLessThan(noPenalty);
    expect(penalized).toBe(64);
    expect(noPenalty).toBe(80);
  });

  it('computeHarmonyScore returns null when no inputs', () => {
    expect(computeHarmonyScore({})).toBe(null);
  });

  it('computeHarmonyScore blends academic and inverted behavior when no base', () => {
    const score = computeHarmonyScore({ academicProgress: 70, behaviorIntensity: 65 });
    expect(score).toBe(53);
  });
});
