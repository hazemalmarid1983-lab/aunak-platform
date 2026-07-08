import { describe, it, expect } from 'vitest';
import { b2gChildCode, anonymizeStudentRecord, isB2GRole } from '../api/_handlers/b2g/anonymize.js';

describe('b2gAnonymization', () => {
  it('b2gChildCode is stable CHD-#### format', () => {
    const a = b2gChildCode('recABCDEFGHIJKLM');
    const b = b2gChildCode('recABCDEFGHIJKLM');
    expect(a).toBe(b);
    expect(a).toMatch(/^CHD-\d{4}$/);
  });

  it('anonymizeStudentRecord strips PII and keeps metrics', () => {
    const out = anonymizeStudentRecord({
      id: 'recABCDEFGHIJKLM',
      fields: {
        student_name: 'Secret Child',
        parent_phone: '966500000000',
        harmony_score: 72,
        academic_progress: 65,
        face_biometric: '{}',
      },
    });
    expect(out.fields.student_name).toBeUndefined();
    expect(out.fields.parent_phone).toBeUndefined();
    expect(out.fields.harmony_score).toBe(72);
    expect(out.fields.b2g_child_code).toMatch(/^CHD-/);
    expect(out._b2g_anonymized).toBe(true);
  });

  it('isB2GRole detects ministry auditor', () => {
    expect(isB2GRole('ministry_auditor')).toBe(true);
    expect(isB2GRole('specialist')).toBe(false);
  });
});
