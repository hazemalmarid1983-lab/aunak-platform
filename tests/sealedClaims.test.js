import { describe, it, expect } from 'vitest';
import {
  buildSealedClaimsByStudentFormula,
  buildSealedClaimsForDayFormula,
  isValidSealedClaim,
  assertClaimNotSealed,
  CLAIM_STATUS_SEALED,
} from '../src/lib/sealedClaims.js';
import { mapSealedClaim, computeDateRange, REPORT_PERIODS } from '../src/lib/reportEngine.js';

describe('sealedClaims', () => {
  it('buildSealedClaimsByStudentFormula escapes quotes and includes Sealed status', () => {
    const formula = buildSealedClaimsByStudentFormula("O'Brien", '2026-07-01', '2026-07-08');
    expect(formula).toContain("O\\'Brien");
    expect(formula).toContain(`'${CLAIM_STATUS_SEALED}'`);
    expect(formula).toContain("2026-07-01");
    expect(formula).toContain("2026-07-08");
  });

  it('buildSealedClaimsForDayFormula filters single day', () => {
    const formula = buildSealedClaimsForDayFormula('Ahmad', '2026-07-08');
    expect(formula).toContain('2026-07-08');
    expect(formula).toContain(CLAIM_STATUS_SEALED);
  });

  it('isValidSealedClaim validates mapped claim shape', () => {
    expect(
      isValidSealedClaim({
        studentName: 'Test',
        sessionDate: '2026-07-08',
        claimStatus: CLAIM_STATUS_SEALED,
      })
    ).toBe(true);
    expect(isValidSealedClaim({ studentName: 'Test', claimStatus: 'Open' })).toBe(false);
  });

  it('mapSealedClaim maps Airtable daily session fields', () => {
    const mapped = mapSealedClaim({
      id: 'recABC123',
      fields: {
        session_date: '2026-07-08',
        student_name: 'Nova',
        specialist_name: 'Hajar',
        notes: 'Goal achieved',
        claim_status: CLAIM_STATUS_SEALED,
      },
    });
    expect(mapped.sessionDate).toBe('2026-07-08');
    expect(mapped.studentName).toBe('Nova');
    expect(mapped.claimStatus).toBe(CLAIM_STATUS_SEALED);
    expect(isValidSealedClaim(mapped)).toBe(true);
  });

  it('computeDateRange returns weekly window', () => {
    const ref = new Date('2026-07-08T12:00:00Z');
    const range = computeDateRange(REPORT_PERIODS.WEEKLY, ref);
    expect(range.days).toBe(7);
    expect(range.endDate).toBe('2026-07-08');
  });

  it('assertClaimNotSealed blocks edits on sealed sessions', () => {
    expect(() => assertClaimNotSealed({ claim_status: CLAIM_STATUS_SEALED })).toThrow(
      'CLAIM_SEALED_IMMUTABLE'
    );
    expect(() => assertClaimNotSealed({ claim_status: 'Open' })).not.toThrow();
  });
});
