import { describe, it, expect } from 'vitest';
import {
  formatB2GChildCode,
  mapStudentToB2GView,
  mapSessionToB2GView,
  calculateB2GRiskScore,
  computeCompliancePercent,
  isB2GRole,
} from '../src/lib/b2gAnonymization.js';
import { b2gChildCode, anonymizeStudentRecord } from '../api/_handlers/b2g/anonymize.js';

describe('b2gAnonymization (shared module)', () => {
  it('formatB2GChildCode uses first 4 hex chars uppercase', () => {
    expect(formatB2GChildCode('a3f2b891c0')).toBe('CHD-A3F2');
  });

  it('mapStudentToB2GView strips PII and exposes metrics', () => {
    const view = mapStudentToB2GView({
      id: 'recABCDEFGHIJKLM',
      fields: {
        student_name: 'Secret',
        parent_phone: '966500',
        face_biometric: '{}',
        harmony_score: 80,
        focus_level: 70,
        behavior_intensity: 20,
        b2g_child_code: 'CHD-A3F2',
      },
    });
    expect(view.b2gCode).toBe('CHD-A3F2');
    expect(view.fields.student_name).toBeUndefined();
    expect(view.harmonyScore).toBe(80);
    expect(view.focusLevel).toBe(70);
    expect(view.riskScore).toBeGreaterThanOrEqual(0);
    expect(view._b2g_anonymized).toBe(true);
  });

  it('mapSessionToB2GView strips specialist and student names', () => {
    const view = mapSessionToB2GView({
      id: 'recSESS001',
      fields: {
        student_name: 'Ali',
        specialist_name: 'Dr. X',
        session_date: '2026-07-08',
        claim_status: 'sealed',
      },
    });
    expect(view.sessionDate).toBe('2026-07-08');
    expect(view.sealed).toBe(true);
    expect(view.fields).toBeUndefined();
  });

  it('computeCompliancePercent counts sealed sessions', () => {
    const pct = computeCompliancePercent([
      { sealed: true },
      { sealed: false },
      { sealed: true },
    ]);
    expect(pct).toBe(67);
  });

  it('calculateB2GRiskScore increases with behavior intensity', () => {
    const low = calculateB2GRiskScore({ behavior_intensity: 10, harmony_score: 90, focus_level: 90 });
    const high = calculateB2GRiskScore({ behavior_intensity: 90, harmony_score: 20, focus_level: 20 });
    expect(high).toBeGreaterThan(low);
  });

  it('isB2GRole detects ministry auditor', () => {
    expect(isB2GRole('ministry_auditor')).toBe(true);
    expect(isB2GRole('specialist')).toBe(false);
  });
});

describe('b2g server HMAC', () => {
  it('b2gChildCode is stable CHD-HEXX format', () => {
    const a = b2gChildCode('recABCDEFGHIJKLM');
    const b = b2gChildCode('recABCDEFGHIJKLM');
    expect(a).toBe(b);
    expect(a).toMatch(/^CHD-[A-F0-9]{4}$/);
  });

  it('anonymizeStudentRecord strips PII via server adapter', () => {
    const out = anonymizeStudentRecord({
      id: 'recABCDEFGHIJKLM',
      fields: {
        student_name: 'Secret Child',
        parent_phone: '966500000000',
        harmony_score: 72,
        focus_level: 65,
        face_biometric: '{}',
      },
    });
    expect(out.fields.student_name).toBeUndefined();
    expect(out.fields.harmony_score).toBe(72);
    expect(out.fields.b2g_child_code).toMatch(/^CHD-/);
    expect(out._b2g_anonymized).toBe(true);
  });
});
