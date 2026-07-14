import { describe, it, expect } from 'vitest';
import {
  computeHarmonyScore,
  normalize0to100,
  HARMONY_GAP_PENALTY_RATE,
} from '../src/lib/harmonyEngine.js';

describe('harmonyEngine', () => {
  it('normalize0to100 clamps and parses percentages', () => {
    expect(normalize0to100('85%')).toBe(85);
    expect(normalize0to100(0.85)).toBe(85);
    expect(normalize0to100('bad')).toBe(null);
  });

  it('Harmony Score = Base − (Gap × 0.2)', () => {
    // Base 80, Gap |90−60|=30 → 80 − 30*0.2 = 74
    const score = computeHarmonyScore({
      academicProgress: 90,
      behaviorIntensity: 60,
      baseScore: 80,
    });
    expect(HARMONY_GAP_PENALTY_RATE).toBe(0.2);
    expect(score).toBe(74);
  });

  it('zero gap leaves base unchanged', () => {
    const score = computeHarmonyScore({
      academicProgress: 80,
      behaviorIntensity: 80,
      baseScore: 80,
    });
    expect(score).toBe(80);
  });

  it('computeHarmonyScore returns null when no inputs', () => {
    expect(computeHarmonyScore({})).toBe(null);
  });

  it('computeHarmonyScore blends academic and inverted behavior when no base', () => {
    // base = round((70 + (100-65))/2) = round(52.5) = 53
    // gap = |70-65|=5 → 53 − 5*0.2 = 52
    const score = computeHarmonyScore({ academicProgress: 70, behaviorIntensity: 65 });
    expect(score).toBe(52);
  });
});
