import { describe, expect, it } from 'vitest';
import {
  filterGoalBank,
  getCoreGoalsForGroup,
  getExtendedBankGoals,
  groupGoalsByDomain,
  resolveAgeBand,
  suggestGoalsForStudent,
  countGoalsForGroup,
} from '../src/lib/goalBank.js';
import { detectAttendanceAnomalies, detectGoalEvidenceAnomalies } from '../src/lib/governanceAnomalies.js';
import { ATTENDANCE_STATUS } from '../src/lib/attendanceLedger.js';

describe('goalBank', () => {
  it('resolves age bands', () => {
    expect(resolveAgeBand(3)?.id).toBe('early');
    expect(resolveAgeBand(7)?.id).toBe('primary');
    expect(resolveAgeBand(16)?.id).toBe('teen');
  });

  it('partitions core vs extended bank by age and severity', () => {
    const core = getCoreGoalsForGroup({ age: 4, severity: 'severe' });
    const bank = getExtendedBankGoals({ age: 4, severity: 'severe' });
    expect(core.length).toBeGreaterThan(0);
    expect(core.every((g) => g.tier === 'core')).toBe(true);
    expect(bank.every((g) => g.tier === 'bank')).toBe(true);
    expect(core.every((g) => g.ageBands.includes('early') && g.severities.includes('severe'))).toBe(
      true
    );
  });

  it('groups by domain', () => {
    const core = getCoreGoalsForGroup({ age: 8, severity: 'moderate' });
    const grouped = groupGoalsByDomain(core);
    expect(grouped.length).toBeGreaterThan(0);
    expect(grouped[0].meta).toBeTruthy();
  });

  it('suggests a limited mixed-domain set from core', () => {
    const s = suggestGoalsForStudent({ age: 8, severity: 'mild', limit: 5 });
    expect(s.length).toBeLessThanOrEqual(5);
    expect(s.length).toBeGreaterThan(0);
  });

  it('counts core and bank for a group', () => {
    const c = countGoalsForGroup({ age: 11, severity: 'moderate' });
    expect(c.total).toBe(c.core + c.bank);
    expect(c.total).toBeGreaterThan(0);
  });

  it('supports search filter', () => {
    const hits = filterGoalBank({ age: 7, severity: 'moderate', search: 'دور' });
    expect(hits.some((g) => /دور/.test(g.ar))).toBe(true);
  });
});

describe('governanceAnomalies', () => {
  it('flags end-of-month bulk seals', () => {
    const rows = Array.from({ length: 6 }, (_, i) => ({
      sealed: true,
      studentId: 'stu1',
      date: `2026-06-0${i + 1}`,
      sealedAt: '2026-06-30T10:00:00.000Z',
      status: ATTENDANCE_STATUS.PRESENT,
      biometricVerified: false,
    }));
    const alerts = detectAttendanceAnomalies(rows);
    expect(alerts.some((a) => a.code === 'END_OF_MONTH_BULK_SEAL')).toBe(true);
  });

  it('flags goals without evidence when plan has bare goals', () => {
    const alerts = detectGoalEvidenceAnomalies({
      studentIds: ['stu-x'],
      evidenceRows: [],
      plansByStudent: {
        'stu-x': {
          studentId: 'stu-x',
          goals: [
            { goalId: 'g1', labelAr: 'a' },
            { goalId: 'g2', labelAr: 'b' },
          ],
        },
      },
    });
    expect(alerts.some((a) => a.code === 'GOALS_WITHOUT_EVIDENCE')).toBe(true);
  });
});
