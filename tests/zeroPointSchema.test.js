import { describe, it, expect } from 'vitest';
import {
  ZERO_POINT_FIELD_COUNT,
  buildZeroPointReport,
  extractProgrammedGoal,
  zeroPointAirtableFields,
} from '../src/lib/zeroPointSchema.js';

describe('zeroPointSchema', () => {
  it('defines exactly 66 clinical fields', () => {
    expect(ZERO_POINT_FIELD_COUNT).toBe(66);
  });

  it('buildZeroPointReport produces JSON payload with composite score', () => {
    const report = buildZeroPointReport({
      activeScale: 'CARS-2',
      rawNotes: 'Moderate social delay',
      finalScore: 42,
      assessor: 'Dr. Test',
      fieldValues: { cars_01: 2, cars_02: 3 },
    });
    expect(report.schema_version).toBe('1.0');
    expect(report.field_count).toBe(66);
    expect(Object.keys(report.fields).length).toBe(66);
    expect(report.active_scale).toBe('CARS-2');
    expect(report.composite_score).not.toBe(null);
    expect(report.programmed_goal_suggestion).toBeTruthy();
  });

  it('zeroPointAirtableFields writes flat Students columns only', () => {
    const report = buildZeroPointReport({ activeScale: 'VB-MAPP', finalScore: 55 });
    const fields = zeroPointAirtableFields(report);
    expect(fields.zero_point_report).toContain('"schema_version"');
    expect(fields.comprehensive_assessment_status).toBe('completed');
    expect(fields.smart_session_fields).toBe(66);
    expect(fields.programmed_goal).toBe(extractProgrammedGoal(report));
  });
});
