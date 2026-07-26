/**
 * Dual Hard Freeze — attendance / session writes locked by duty_shift clocks.
 * morning → hard freeze at 14:00 server local · evening → hard freeze at 21:00.
 */

import { DUTY_SHIFT } from './airtableFields.js';

export const FREEZE_CLOCK = {
  [DUTY_SHIFT.morning]: { hour: 14, minute: 0, label: '14:00' },
  [DUTY_SHIFT.evening]: { hour: 21, minute: 0, label: '21:00' },
  /** Government single-day shift follows morning seal clock. */
  [DUTY_SHIFT.day]: { hour: 14, minute: 0, label: '14:00' },
};

export function normalizeDutyShift(raw) {
  const v = String(raw ?? '')
    .trim()
    .toLowerCase();
  if (v === DUTY_SHIFT.morning || v === 'صباحي' || v === 'am') return DUTY_SHIFT.morning;
  if (v === DUTY_SHIFT.evening || v === 'مسائي' || v === 'pm') return DUTY_SHIFT.evening;
  if (v === DUTY_SHIFT.day || v === 'نهاري') return DUTY_SHIFT.day;
  return '';
}

/** Minutes since local midnight for a Date. */
function minutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

/** Local calendar YYYY-MM-DD (server / browser timezone). */
export function localIsoDate(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * True when writes for this duty_shift are hard-frozen at `now`.
 * @param {{ dutyShift?: string, now?: Date }} opts
 */
export function isDutyShiftHardFrozen({ dutyShift, now = new Date() } = {}) {
  const shift = normalizeDutyShift(dutyShift);
  if (!shift) return false;
  const clock = FREEZE_CLOCK[shift];
  if (!clock) return false;
  const cutoff = clock.hour * 60 + clock.minute;
  return minutesOfDay(now) >= cutoff;
}

/**
 * Gate a write for today's attendance / corrections.
 * Returns { ok: true } or { ok: false, error, freezeAt, dutyShift }.
 */
export function assertDutyShiftWritable({
  dutyShift,
  attendanceDate,
  now = new Date(),
} = {}) {
  const shift = normalizeDutyShift(dutyShift);
  if (!shift) {
    return { ok: false, error: 'DUTY_SHIFT_REQUIRED', dutyShift: '' };
  }

  const today = localIsoDate(now);
  const date = String(attendanceDate || today).slice(0, 10);

  /** Only hard-freeze same-day operational rows; historical edits stay blocked by seal. */
  if (date !== today) {
    return { ok: true, dutyShift: shift, sameDay: false };
  }

  if (isDutyShiftHardFrozen({ dutyShift: shift, now })) {
    const clock = FREEZE_CLOCK[shift];
    return {
      ok: false,
      error: 'DUTY_SHIFT_HARD_FREEZE',
      dutyShift: shift,
      freezeAt: clock?.label ?? null,
      message:
        shift === DUTY_SHIFT.evening
          ? 'الختم المسائي مُقفل بعد الساعة 21:00 — لا يمكن تعديل حضور اليوم'
          : 'الختم الصباحي مُقفل بعد الساعة 14:00 — لا يمكن تعديل حضور اليوم',
    };
  }

  return { ok: true, dutyShift: shift, sameDay: true };
}

/** Extract duty_shift from Airtable request body (single or batch). */
export function extractDutyShiftFromBody(body) {
  if (body == null) return '';
  const parsed = typeof body === 'string' ? safeJson(body) : body;
  if (!parsed || typeof parsed !== 'object') return '';

  const fromFields = (fields) =>
    normalizeDutyShift(fields?.duty_shift ?? fields?.Duty_Shift ?? fields?.['duty_shift']);

  if (parsed.fields) return fromFields(parsed.fields);
  if (Array.isArray(parsed.records)) {
    for (const rec of parsed.records) {
      const s = fromFields(rec?.fields);
      if (s) return s;
    }
  }
  return normalizeDutyShift(parsed.duty_shift);
}

export function extractAttendanceDateFromBody(body) {
  if (body == null) return '';
  const parsed = typeof body === 'string' ? safeJson(body) : body;
  if (!parsed || typeof parsed !== 'object') return '';
  const pick = (fields) =>
    String(fields?.attendance_date ?? fields?.Attendance_Date ?? fields?.date ?? '').slice(0, 10);
  if (parsed.fields) return pick(parsed.fields);
  if (Array.isArray(parsed.records) && parsed.records[0]?.fields) {
    return pick(parsed.records[0].fields);
  }
  return String(parsed.attendance_date ?? parsed.date ?? '').slice(0, 10);
}

function safeJson(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
