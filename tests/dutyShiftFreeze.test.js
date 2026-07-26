import { describe, it, expect } from 'vitest';
import {
  assertDutyShiftWritable,
  isDutyShiftHardFrozen,
  normalizeDutyShift,
} from '../src/lib/dutyShiftFreeze.js';
import { buildShiftSlots } from '../src/lib/smartScheduler.js';
import { DUTY_SHIFT } from '../src/lib/airtableFields.js';

describe('dutyShiftFreeze (dual hard freeze)', () => {
  it('normalizes morning / evening', () => {
    expect(normalizeDutyShift('morning')).toBe(DUTY_SHIFT.morning);
    expect(normalizeDutyShift('evening')).toBe(DUTY_SHIFT.evening);
    expect(normalizeDutyShift('صباحي')).toBe(DUTY_SHIFT.morning);
  });

  it('freezes morning at/after 14:00', () => {
    const before = new Date('2026-07-17T13:59:00');
    const after = new Date('2026-07-17T14:00:00');
    expect(isDutyShiftHardFrozen({ dutyShift: 'morning', now: before })).toBe(false);
    expect(isDutyShiftHardFrozen({ dutyShift: 'morning', now: after })).toBe(true);
  });

  it('freezes evening at/after 21:00', () => {
    const before = new Date('2026-07-17T20:59:00');
    const after = new Date('2026-07-17T21:00:00');
    expect(isDutyShiftHardFrozen({ dutyShift: 'evening', now: before })).toBe(false);
    expect(isDutyShiftHardFrozen({ dutyShift: 'evening', now: after })).toBe(true);
  });

  it('assertDutyShiftWritable blocks same-day morning after 14:00', () => {
    const now = new Date('2026-07-17T15:30:00');
    const gate = assertDutyShiftWritable({
      dutyShift: 'morning',
      attendanceDate: '2026-07-17',
      now,
    });
    expect(gate.ok).toBe(false);
    expect(gate.error).toBe('DUTY_SHIFT_HARD_FREEZE');
  });
});

describe('smartScheduler slots', () => {
  it('morning has breakfast break after session 3 ending 08:00', () => {
    const slots = buildShiftSlots(DUTY_SHIFT.morning);
    const sessions = slots.filter((s) => s.kind === 'session');
    const brk = slots.find((s) => s.kind === 'break');
    expect(sessions[2].end).toBe('08:00');
    expect(brk).toBeTruthy();
    expect(brk.start).toBe('08:00');
    expect(brk.end).toBe('08:30');
    expect(sessions[3].start).toBe('08:30');
  });

  it('evening is continuous 40min from 16:00 to 20:00', () => {
    const slots = buildShiftSlots(DUTY_SHIFT.evening);
    expect(slots.every((s) => s.kind === 'session')).toBe(true);
    expect(slots[0].start).toBe('16:00');
    expect(slots[slots.length - 1].end).toBe('20:00');
    expect(slots).toHaveLength(6);
  });
});
