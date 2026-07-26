import { describe, it, expect } from 'vitest';
import {
  ZERO_POINT_FIELD_COUNT,
  SCALE_CIS,
  SCALE_EBD,
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
      activeScale: SCALE_EBD,
      rawNotes: 'Moderate social delay',
      finalScore: 42,
      assessor: 'Dr. Test',
      fieldValues: { ebd_a_01: 2, ebd_a_02: 3 },
    });
    expect(report.schema_version).toBe('1.0');
    expect(report.field_count).toBe(66);
    expect(Object.keys(report.fields).length).toBe(66);
    expect(report.active_scale).toBe(SCALE_EBD);
    expect(report.composite_score).not.toBe(null);
    expect(report.programmed_goal_suggestion).toBeTruthy();
  });

  it('zeroPointAirtableFields writes flat Students columns only', () => {
    const report = buildZeroPointReport({ activeScale: SCALE_CIS, finalScore: 55 });
    const fields = zeroPointAirtableFields(report);
    expect(fields.zero_point_report).toContain('"schema_version"');
    expect(fields.comprehensive_assessment_status).toBe('completed');
    expect(fields.smart_session_fields).toBe(66);
    expect(fields.programmed_goal).toBe(extractProgrammedGoal(report));
  });
});
